<template>
  <section
    id="contact-nebula"
    class="relative min-h-screen flex flex-col items-center text-center text-(--light-white) overflow-hidden bg-(--blue) pb-[100px]"
    aria-labelledby="contact-title"
  >
    <canvas id="nebula-canvas" class="absolute inset-0 w-full h-full z-0 pointer-events-none" ref="nebulaCanvasRef" aria-hidden="true" />

    <div class="relative z-[2] max-w-[700px] w-full px-4">
      <div class="h-[340px] flex items-end justify-center mb-6"
           style="background-image:url('/media/projectSection.avif');background-size:contain;background-position:center top;background-repeat:no-repeat;">
        <h2 id="contact-title" class="main-title uppercase">{{ t('contact_me') }}</h2>
      </div>

      <fieldset class="nebula-panel rounded-[20px] p-10 relative font-['Anta'] text-left">
        <legend class="font-bold text-2xl text-(--light-white) px-2 w-full text-center">NOVENIX</legend>
        <img class="h-20 w-20 mx-auto mb-4" src="/media/favicon.ico" alt="Icona Novenix" loading="lazy" />

        <p class="text-(--light-white) opacity-90 mb-5 text-center">{{ t('call-to-action') }}</p>

        <SocialLinks class="mb-6" />

        <form class="space-y-4" @submit.prevent="submitForm" novalidate>
          <input
            v-model="form.name"
            type="text"
            name="user_name"
            class="nebula-input w-full"
            :placeholder="`> ${t('home') === 'Home' ? 'NOME' : 'NAME'}`"
            required
          />
          <input
            v-model="form.email"
            type="email"
            name="user_email"
            class="nebula-input w-full"
            placeholder="> EMAIL"
            required
          />
          <textarea
            v-model="form.message"
            name="message"
            class="nebula-input w-full"
            :placeholder="`> ${t('home') === 'Home' ? 'MESSAGGIO' : 'MESSAGE'}`"
            rows="4"
            required
          />

          <!-- Honeypot -->
          <input type="text" name="honeypot" class="hidden" v-model="form.honeypot" />

          <div class="flex items-start gap-3">
            <input type="checkbox" id="privacy-nebula" v-model="form.privacy" required
                   class="mt-1 w-[18px] h-[18px] cursor-pointer" style="accent-color:var(--green)" />
            <label for="privacy-nebula" class="text-sm text-(--light-white)">
              {{ t('accept-text') }}
              <a href="https://www.iubenda.com/privacy-policy/22034714" target="_blank" class="text-(--green) underline hover:text-(--cyan)">
                {{ t('privacy-policy-text') }}
              </a>.
            </label>
          </div>

          <button type="submit" class="nebula-btn w-full mt-4" :disabled="sending">
            {{ sending ? '[ INVIO IN CORSO... 🛰️ ]' : t('send_email') }}
          </button>

          <div
            v-if="statusMsg"
            class="mt-3 font-semibold text-center transition-all"
            :class="statusType === 'success' ? 'text-[#00ff9d]' : 'text-[#ff6b6b]'"
          >
            {{ statusMsg }}
          </div>
        </form>
      </fieldset>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { useParticles } from '@/composables/useParticles'
import SocialLinks from '@/components/ui/SocialLinks.vue'

const { t } = useLocale()
const { createParticleSystem } = useParticles()

const nebulaCanvasRef = ref(null)

const form = ref({ name: '', email: '', message: '', privacy: false, honeypot: '' })
const sending = ref(false)
const statusMsg = ref('')
const statusType = ref('')

function setStatus(msg, type) {
  statusMsg.value = msg
  statusType.value = type
  setTimeout(() => { statusMsg.value = ''; statusType.value = '' }, 5000)
}

async function submitForm() {
  if (form.value.honeypot) return
  if (!form.value.privacy) return
  if (!form.value.name.trim() || !form.value.email.trim() || !form.value.message.trim()) {
    setStatus('⚠️ Compila tutti i campi prima di inviare.', 'error')
    return
  }

  sending.value = true
  statusMsg.value = ''

  try {
    const emailjs = window.emailjs
    if (!emailjs) throw new Error('EmailJS non disponibile')

    await emailjs.send('service_u7lr3ns', 'template_6n4jms3', {
      user_name: form.value.name,
      user_email: form.value.email,
      message: form.value.message,
    })

    setStatus('✅ Messaggio inviato con successo! Ti risponderò al più presto 🚀', 'success')
    form.value = { name: '', email: '', message: '', privacy: false, honeypot: '' }
  } catch (err) {
    console.error(err)
    setStatus('❌ Errore durante l\'invio. Riprova più tardi.', 'error')
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  const emailjs = window.emailjs
  if (emailjs) emailjs.init('07tg3BWu-X8TPTKyi')

  const section = document.getElementById('contact-nebula')
  const nebulaSystem = createParticleSystem(nebulaCanvasRef.value, 100, 'rgba(0,229,255,0.7)')
  if (!section || !nebulaSystem) return

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? nebulaSystem.start() : nebulaSystem.stop())
  }, { threshold: 0.1 })
  observer.observe(section)
})
</script>

<style scoped>
.nebula-panel {
  border: 2px solid var(--green);
  background: rgba(18, 87, 189, 0.077);
  backdrop-filter: blur(6px);
  box-shadow: 0 0 25px var(--green), 0 0 15px var(--cyan) inset;
  animation: floatPanel 6s ease-in-out infinite;
}
.nebula-panel legend { color: var(--light-white); }

.nebula-input {
  background: rgba(0,100,200,.1);
  border: 2px solid var(--green);
  border-radius: 8px;
  color: var(--light-white);
  padding: 10px;
  outline: none;
  box-shadow: 0 0 10px var(--cyan) inset;
  transition: 0.3s;
  font-family: 'Anta', sans-serif;
}
.nebula-input::placeholder { color: var(--light-white); opacity: 0.7; }
.nebula-input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 15px var(--orange) inset, 0 0 10px var(--yellow);
  background-color: rgba(0,50,150,.3);
}

.nebula-btn {
  background: transparent;
  border: 2px solid var(--green);
  border-radius: 5px;
  color: var(--light-white);
  padding: 12px 25px;
  font-family: 'Anta', sans-serif;
  text-transform: uppercase;
  box-shadow: 0 0 15px var(--cyan);
  cursor: pointer;
  transition: 0.3s;
}
.nebula-btn:hover:not(:disabled) {
  background: var(--cyan);
  color: #001f4d;
  box-shadow: 0 0 25px var(--cyan), 0 0 20px var(--green) inset;
}
.nebula-btn:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
