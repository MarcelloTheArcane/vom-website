<template>
  <div>
    <h1>You are not alone</h1>
    <p id="subtitle">These resources are here for you 24/7</p>
    <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3">
      <div v-for="resource in resources" :key="resource.title" class="col mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h2 class="card-title">{{ resource.title }}</h2>
            <p class="card-text">{{ resource.description }}</p>
            <b-button
              v-for="button in resource.buttons"
              :key="button.href"
              :variant="button.style"
              :href="button.href"
              >{{ button.text }}</b-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: 'Get help',
      description: 'Mental health resources, here for you 24/7.',
      resources: [
        {
          title: '911',
          description:
            'If you or someone you know is in immediate danger, call 911 now.',
          buttons: [
            {
              href: 'tel:911',
              style: 'danger',
              text: 'Call 911',
            },
          ],
        },
        {
          title: 'Suicide Prevention Lifeline',
          description:
            'For anyone who is depressed, going through a hard time, needs to talk, or is thinking about suicide.',
          buttons: [
            {
              href: 'tel:1-800-273-8255',
              style: 'primary',
              text: 'Call',
            },
            {
              href: 'https://suicidepreventionlifeline.org/chat/',
              style: 'secondary',
              text: 'Online Chat',
            },
          ],
        },
        {
          title: 'Crisis Text Line',
          description: 'For any crisis.',
          buttons: [
            {
              href: 'sms:741741?&body=HOME',
              style: 'primary',
              text: 'Text',
            },
          ],
        },
        {
          title: 'The Trevor Project',
          description:
            'For LGBTQ individuals who are in crisis, feeling suicidal, or in need of a safe and judgment-free place to talk.',
          buttons: [
            {
              href: 'tel:1-866-488-7386',
              style: 'primary',
              text: 'Call',
            },
            {
              href: 'sms:678678?&body=START',
              style: 'secondary',
              text: 'Text',
            },
            {
              href: 'https://www.thetrevorproject.org/get-help-now/',
              style: 'secondary',
              text: 'Online Chat',
            },
          ],
        },
        {
          title: 'Domestic Violence Hotline',
          description:
            'For anyone who is experiencing domestic violence, seeking resources or information, or questioning unhealthy aspects of their relationship.',
          buttons: [
            {
              href: 'tel:1-800-799-7233',
              style: 'primary',
              text: 'Call',
            },
            {
              href: 'https://www.thehotline.org/get-help/',
              style: 'secondary',
              text: 'Online Chat',
            },
          ],
        },
        {
          title: 'Disaster Distress Helpline',
          description:
            'For anyone who is experiencing emotional distress related to any natural or human-caused disaster.',
          buttons: [
            {
              href: 'tel:1-800-985-5990',
              style: 'primary',
              text: 'Call',
            },
          ],
        },
      ],
    }
  },
  head() {
    return {
      title: `${this.title} | Value Our Minds`,
      meta: [
        {
          name: 'description',
          content: this.description,
        },
      ],
    }
  },
}
</script>

<style lang="scss" scoped>
.btn {
  margin-right: 0.3em;
}
</style>
