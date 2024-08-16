// onnx-worker.js
importScripts("https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js");

let ortSession = null;

self.onmessage = async function (e) {
  if (e.data.type === "init") {
    try {
      console.log("ONNX Runtime initialized in Web Worker");
      self.postMessage({ type: "init", status: "success" });
    } catch (error) {
      console.error("Error initializing ONNX Runtime in Web Worker:", error);
      self.postMessage({ type: "init", status: "error", error: error.message });
    }
  } else if (e.data.type === "loadModel") {
    try {
      console.log(e.data.modelPath);
      ortSession = await ort.InferenceSession.create(e.data.modelPath);
      console.log("Model loaded successfully in Web Worker");
      self.postMessage({ type: "loadModel", status: "success" });
    } catch (error) {
      console.error("Error loading model in Web Worker:", error);
      self.postMessage({
        type: "loadModel",
        status: "error",
        error: error.message,
      });
    }
  } else if (e.data.type === "run") {
    try {
      const result = await ortSession.run(e.data.feeds);
      self.postMessage({ type: "run", status: "success", result });
    } catch (error) {
      console.error("Error running inference in Web Worker:", error);
      self.postMessage({ type: "run", status: "error", error: error.message });
    }
  }
};
