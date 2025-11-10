import { ReadingsModel } from "../models/readingsModel.js";
import { ThresholdsModel } from "../models/thresholdsModel.js";
import { DifferencesModel } from "../models/differencesModel.js";

export const ReadingsController = {
  async list(req, res) {
    try {
      const data = await ReadingsModel.list();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async latest(req, res) {
    try {
      const data = await ReadingsModel.latest();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const created = await ReadingsModel.create(req.body);

      // compute and persist difference to reading_differences table
      try {
        // prefer threshold_value from created reading, otherwise get latest threshold
        let thresholdValue = created.threshold_value;
        if (thresholdValue === null || typeof thresholdValue !== "number") {
          const latest = await ThresholdsModel.latest();
          thresholdValue = latest?.value ?? null;
        }

        if (typeof thresholdValue === "number") {
          const diff = Number(created.temperature) - Number(thresholdValue);
          // create difference row (ignore result)
          await DifferencesModel.create({
            temperature: Number(created.temperature),
            threshold_value: Number(thresholdValue),
            difference: Number(Number(diff).toFixed(2)),
          });
        }
      } catch (err) {
        // don't block the response if difference insert fails; log to console
        console.error("Failed to insert difference record:", err.message || err);
      }

      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};
