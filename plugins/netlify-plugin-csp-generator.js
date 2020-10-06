const fs = require('fs')
const { performance } = require('perf_hooks')
const globby = require('globby')
const { sha256 } = require('js-sha256')
const { JSDOM } = require('jsdom')

module.exports = {
  onPostBuild: async ({ inputs }) => {
    const startTime = performance.now()

    const { buildDir, exclude, policies, disablePolicies, disableGeneratedPolicies } = inputs
    const mergedPolicies = mergeWithDefaultPolicies(policies)

    const htmlFiles = `${buildDir}/**/**.html`
    const excludeFiles = (exclude || []).map((filePath) => `!${filePath.replace(/^!/, '')}`)
    console.info(`Excluding ${excludeFiles.length} ${excludeFiles.length === 1 ? 'file' : 'files'}`)

    const lookup = [htmlFiles].concat(excludeFiles)
    const paths = await globby(lookup)
    console.info(`Found ${paths.length} HTML ${paths.length === 1 ? 'file' : 'files'}`)

    const processFile = createFileProcessor(buildDir, disableGeneratedPolicies)

    const processedFileHeaders = await Promise.all(
      paths.map(path => fs.promises.readFile(path, 'utf-8').then(processFile(path)))
    )

    const { globalHeaders, localHeaders } = processedFileHeaders
      .reduce(splitToGlobalAndLocal, { globalHeaders: [], localHeaders: [] })

    const file = globalHeaders
      .concat(...localHeaders)
      .map(({ webPath, cspObject }) => {
        const cspString = buildCSPArray(mergedPolicies, disablePolicies, cspObject).join(' ')
        return `${webPath}\n  Content-Security-Policy: ${cspString}`
      }).join('\n')

    fs.appendFileSync(`${buildDir}/_headers`, file)

    console.log(file)

    const completedTime = performance.now() - startTime
    console.info(`Saved at ${buildDir}/_headers - ${(completedTime / 1000).toFixed(2)} seconds`)
  },
}

function mergeWithDefaultPolicies (policies) {
  const defaultPolicies = {
    defaultSrc: '',
    childSrc: '',
    connectSrc: '',
    fontSrc: '',
    frameSrc: '',
    imgSrc: '',
    manifestSrc: '',
    mediaSrc: '',
    objectSrc: '',
    prefetchSrc: '',
    scriptSrc: '',
    scriptSrcElem: '',
    scriptSrcAttr: '',
    styleSrc: '',
    styleSrcElem: '',
    styleSrcAttr: '',
    workerSrc: '',
    baseUri: '',
    formAction: '',
    frameAncestors: '',
  }

  return {...defaultPolicies, ...policies}
}

function createFileProcessor (buildDir, disableGeneratedPolicies) {
  return path => file => {
    const dom = new JSDOM(file)
    const shouldGenerate = (key) => !(disableGeneratedPolicies || []).includes(key)
    const generateHashesFromElement = generateHashes(dom, element => element.innerHTML)
    const generateHashesFromStyle = generateHashes(dom, element => element.getAttribute('style'))

    const scripts = shouldGenerate('scriptSrc') ? generateHashesFromElement('script') : []
    const styles = shouldGenerate('styleSrc') ? generateHashesFromElement('style') : []
    const inlineStyles = shouldGenerate('styleSrc') ? generateHashesFromStyle('[style]') : []

    const indexMatcher = new RegExp(`^${buildDir}(.*)index\\.html$`)
    const nonIndexMatcher = new RegExp(`^${buildDir}(.*\\/).*?\\.html$`)

    let webPath = null
    let globalCSP = null
    if (path.match(indexMatcher)) {
      webPath = path.replace(indexMatcher, '$1')
      globalCSP = false
    } else {
      webPath = path.replace(nonIndexMatcher, '$1*')
      globalCSP = true
    }

    const cspObject = {
      scriptSrc: scripts,
      styleSrc: [...styles, ...inlineStyles],
    }

    return {
      webPath,
      cspObject,
      globalCSP,
    }
  }
}

function generateHashes (dom, getPropertyValue) {
  return selector => {
    const hashes = new Set()
    for (const matchedElement of dom.window.document.querySelectorAll(selector)) {
      const value = getPropertyValue(matchedElement)
      if (value.length) {
        const hash = sha256.arrayBuffer(value)
        const base64hash = Buffer.from(hash).toString('base64')
        hashes.add(`'sha256-${base64hash}'`)
      }
    }
    return Array.from(hashes)
  }
}

function buildCSPArray (allPolicies, disablePolicies, hashes) {
  const camelCaseToKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

  return Object.entries(allPolicies)
    .filter(([key, defaultPolicy]) => {
      const generatedOrDefault = (hashes[key] && hashes[key].length) || defaultPolicy
      const notDisabled = !(disablePolicies || []).includes(key)
      return generatedOrDefault && notDisabled
    })
    .map(([key, defaultPolicy]) => {
      const policy = `${hashes[key] && hashes[key].join(' ') || ''} ${defaultPolicy}`;
      return `${camelCaseToKebabCase(key)} ${policy.trim()};`
    })
}

function splitToGlobalAndLocal (final, header) {
  if (header.globalCSP) {
    const existingIndex = final.globalHeaders.findIndex(({ webPath }) => webPath === header.webPath)
    if (existingIndex !== -1) {
      final.globalHeaders[existingIndex].cspObject.scriptSrc.push(...header.cspObject.scriptSrc)
      final.globalHeaders[existingIndex].cspObject.styleSrc.push(...header.cspObject.styleSrc)
    } else {
      final.globalHeaders.push(header)
    }
  } else {
    final.localHeaders.push(header)
  }

  return final
}
