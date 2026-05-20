import {
  uploadPaymentProof,
  approvePayment,
  rejectPayment,
  getAllPaymentProof,
} from "../services/paymentService.js";

export const getAll = async (req, res) => {
  try {
    const payments = await getAllPaymentProof();
    res.status(200).json({
      message: "All payment proof fetched successfully",
      result: payments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const upload = async (req, res) => {
  try {
    const { paymentScheduleId, amount, senderName } = req.body;

    const file = req.file;
    const filePath = `uploads/payment/${file.filename}`;

    const result = await uploadPaymentProof(
      paymentScheduleId,
      filePath,
      amount,
      senderName,
    );

    res.status(201).json({
      message: "Payment uploaded successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const approve = async (req, res) => {
  try {
    const { paymentProofId } = req.body;
    // const adminId = req.user.id;
    const adminId = 1;

    const result = await approvePayment(paymentProofId, adminId);

    res.status(200).json({
      message: "Payment approved successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const reject = async (req, res) => {
  try {
    const { paymentProofId, rejectionReason } = req.body;
    // const adminId = req.user.id;
    const adminId = 1;

    const result = await rejectPayment(
      paymentProofId,
      adminId,
      rejectionReason,
    );

    res.status(200).json({
      message: "Payment rejected successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
