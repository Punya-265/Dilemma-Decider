import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  name: String,
  pros: [String],
  cons: [String]
}, { _id: false });

const decisionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  rawDilemma: { type: String, required: true },
  result: {
    coreSummary: String,
    optionA: optionSchema,
    optionB: optionSchema,
    blindSpot: String,
    objectiveRecommendation: String
  }
}, { timestamps: true });

export default mongoose.model('Decision', decisionSchema);
