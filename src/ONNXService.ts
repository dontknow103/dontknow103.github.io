export interface InferenceFeeds {
  tokens: number[];
  tones: number[];
  speakers: number;
}

export class ONNXService {
  private worker: Worker | null = null;
  private modelLoaded: boolean = false;

  constructor(private modelFileName: string) {}

  async initializeSession(): Promise<void> {
    if (this.worker) return; // Avoid re-initializing if the worker already exists

    this.worker = new Worker("/onnx-worker.js");
    this.worker.onmessage = this.handleWorkerMessages.bind(this);

    const modelPath = `${window.location.origin}/${this.modelFileName}`;

    return new Promise<void>((resolve, reject) => {
      this.worker!.postMessage({ type: "loadModel", modelPath });

      const checkModelLoaded = setInterval(() => {
        if (this.modelLoaded) {
          clearInterval(checkModelLoaded);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkModelLoaded);
        reject(new Error("Model loading timed out"));
      }, 30000);
    });
  }

  async runInference(feeds: InferenceFeeds): Promise<Float32Array> {
    if (!this.worker) throw new Error("Worker is not initialized");

    this.worker.postMessage({ type: "run", feeds });

    return new Promise<Float32Array>((resolve, reject) => {
      this.worker!.onmessage = (e: MessageEvent) => {
        const { type, status, error, result } = e.data;

        if (type === "run") {
          if (status === "success") {
            resolve(result as Float32Array);
          } else {
            reject(new Error(error));
          }
        }
      };
    });
  }

  private handleWorkerMessages(e: MessageEvent) {
    const { type, status, error } = e.data;

    if (type === "loadModel") {
      if (status === "success") {
        this.modelLoaded = true;
      } else {
        console.error("Error loading model in Web Worker:", error);
      }
    }
  }
}
