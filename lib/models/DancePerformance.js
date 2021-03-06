const mongoose = require('mongoose');
const Dancer = require('./Dancer');
const checkDancers = require('./hook-utils/check-dancers');

const schema = new mongoose.Schema({
  dance: { type: mongoose.Schema.Types.ObjectId, ref: 'Dance', required: true },
  dancers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dancer' }],
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'team', immutable: true }
});

schema.pre('validate', async function(next) {
  await checkDancers(this, 'dancers', next);
});

schema.methods.canUserWrite = schema.methods.canUserRead = async function(user) {
  const dancer = await Dancer.findById(user.dancer);
  return dancer.teams.includes(this.team);
};

schema.statics.getUserQuery = async function(user) {
  const dancer = await Dancer.findById(user.dancer);
  const query = {};
  query.team = dancer.teams;
  return query;
};

const model = mongoose.model('DancePerformance', schema);
model.populatedPaths = 'dance dancers';
model.accessBy = 'team';
module.exports = model;
