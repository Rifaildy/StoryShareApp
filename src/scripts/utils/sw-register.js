const swRegister = async () => {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js")
      console.log("Service worker registered")
    } catch (error) {
      console.log("Failed to register service worker", error)
    }
  }
}

export default swRegister
