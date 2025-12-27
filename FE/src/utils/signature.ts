export async function signMessage(signer, message) {
    const signature = await signer.signMessage(message);
    return signature;
  }
  