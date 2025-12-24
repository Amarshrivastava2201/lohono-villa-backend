import { fetchAvailableVillas } from "../services/villa.service.js";

export const getAvailableVillas = async (req, res) => {
  try {
    const result = await fetchAvailableVillas(req.query);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: "invalid_request",
      message: error.message
    });
  }
};


import { fetchVillaQuote } from "../services/villa.service.js";

export const getVillaQuote = async (req, res) => {
  try {
    const { villaId } = req.params;

    const result = await fetchVillaQuote(villaId, req.query);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: "invalid_request",
      message: error.message,
    });
  }
};
