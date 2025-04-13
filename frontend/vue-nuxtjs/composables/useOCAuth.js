import { ref, reactive } from 'vue'

export const useOCAuth = () => {

  const authState = reactive({
    idToken: null,
    accessToken: null,
    error: null,
    value: {
      idToken: localStorage.getItem('ocidToken') || null,
      accessToken: null,
      error: null
    }
  })

  const ocAuth = {
    getIdToken: async () => {
      return localStorage.getItem('ocidToken') || null
    },

    signInWithRedirect: async () => {

      window.location.href = 'https://auth.staging.opencampus.xyz/login?return_url=https%253A%252F%252Fstaging.terminal3.io%252Fv1%252Fopenidc%252Fauthorize%253Fclient_id%253DmVpEPP7jCSKyCT4KfoR5DelcRidw2OTS%2526redirect_uri%253Dhttp%25253A%25252F%25252Fapi.login.sandbox.opencampus.xyz%25252Fauth%25252Fredirect%2526response_type%253Dcode%2526scope%253Dopenid%2526state%253D%25257B%252522codeChallenge%252522%25253A%252522PA8AWkiOLjDR1QCCYBPcSY9Q_wRc9Ucj4YvluoFJp3k%252522%25252C%252522redirectUri%252522%25253A%252522http%25253A%25252F%25252Flocalhost%25253A3000%25252Fredirect%252522%25252C%252522originUrl%252522%25253A%252522http%25253A%25252F%25252Flocalhost%25253A3000%25252Fsimple-greeting-dapp%252522%25252C%252522originalState%252522%25253A%252522opencampus%252522%25257D&ref=PARTNER6&mode=sandbox'
    },
    login: async () => {

      window.location.href = 'https://auth.staging.opencampus.xyz/login?return_url=https%253A%252F%252Fstaging.terminal3.io%252Fv1%252Fopenidc%252Fauthorize%253Fclient_id%253DmVpEPP7jCSKyCT4KfoR5DelcRidw2OTS%2526redirect_uri%253Dhttp%25253A%25252F%25252Fapi.login.sandbox.opencampus.xyz%25252Fauth%25252Fredirect%2526response_type%253Dcode%2526scope%253Dopenid%2526state%253D%25257B%252522codeChallenge%252522%25253A%252522PA8AWkiOLjDR1QCCYBPcSY9Q_wRc9Ucj4YvluoFJp3k%252522%25252C%252522redirectUri%252522%25253A%252522http%25253A%25252F%25252Flocalhost%25253A3000%25252Fredirect%252522%25252C%252522originUrl%252522%25253A%252522http%25253A%25252F%25252Flocalhost%25253A3000%25252Fsimple-greeting-dapp%252522%25252C%252522originalState%252522%25253A%252522opencampus%252522%25257D&ref=PARTNER6&mode=sandbox'
    },
    logout: () => {
      localStorage.removeItem('ocidToken')
      authState.idToken = null
      authState.value.idToken = null
    }
  }


  const initAuth = async () => {
    try {
      const token = await ocAuth.getIdToken()
      if (token) {
        authState.idToken = token
        authState.value.idToken = token
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    }
  }

  initAuth()

  return {
    ocAuth,
    authState
  }
}