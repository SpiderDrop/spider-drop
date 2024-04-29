let config;

export async function getConfig() {
  if (config) {
    return config;
  } else {
    const response = await fetch("/config.json");
    config = response.json();
    return config;
  }
}
