async function verifyTurnstile(token) {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  const verificationURL =
    "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  const formData = new URLSearchParams();
  formData.append("secret", secretKey);
  formData.append("response", token);

  try {
    const response = await fetch(verificationURL, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    return false;
  }
}

module.exports = verifyTurnstile;
