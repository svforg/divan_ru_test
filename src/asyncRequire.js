export default (path) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.onload = resolve;
    script.onerror = () => reject(new Error(`Could not load image: ${path}`));

    script.async = true;
    script.src = path;

    document.body.appendChild(script);
  });
}
