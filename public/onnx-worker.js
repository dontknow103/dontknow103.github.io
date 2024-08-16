importScripts("https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js");

let ortSession = null;

self.onmessage = async ({ data }) => {
  const { type, modelPath, feeds } = data;

  try {
    if (type === "loadModel") {
      ortSession = await ort.InferenceSession.create(modelPath);
      self.postMessage({ type: "loadModel", status: "success" });
    } else if (type === "run" && ortSession) {
      const result = await runInference(feeds);
      self.postMessage(
        { type: "run", status: "success", result: result.output.data },
        [result.output.data.buffer]
      );
    }
  } catch (error) {
    self.postMessage({ type, status: "error", error: error.message });
  }
};

const runInference = async ({ tokens, tones, speakers }) => {
  const feeds = {
    tokens: new ort.Tensor("int64", BigInt64Array.from(tokens.map(BigInt)), [
      1,
      tokens.length,
    ]),
    tones: new ort.Tensor("int64", BigInt64Array.from(tones.map(BigInt)), [
      1,
      tones.length,
    ]),
    speakers: new ort.Tensor("int64", BigInt64Array.from([BigInt(speakers)]), [
      1,
    ]),
  };

  return await ortSession.run(feeds);
};
