async function callBackend(path: string) {
  const response = await fetch(`http://localhost:3001${path}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export { callBackend };
