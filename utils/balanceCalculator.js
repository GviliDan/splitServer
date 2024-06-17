const mongoose = require("mongoose");
const User = require("../models/user");

const calculateBalances = async (expenses, userId) => {
  const balances = {};

  expenses.forEach((expense) => {
    const payerId = expense.payer.toString();
    const amountPerParticipant = expense.amount / expense.participants.length;

    // Track the payer's balance
    if (!balances[payerId]) {
      balances[payerId] = 0;
    }
    balances[payerId] += expense.amount;

    // Track each participant's balance
    expense.participants.forEach((participantId) => {
      participantId = participantId.toString();
      if (!balances[participantId]) {
        balances[participantId] = 0;
      }
      balances[participantId] -= amountPerParticipant;
    });
  });

  const userIds = Object.keys(balances);

  // Get user names for all involved user IDs
  const users = await User.find({ _id: { $in: userIds } });

  const userMap = users.reduce((map, user) => {
    map[user._id.toString()] = user;
    return map;
  }, {});

  // Format the balances with respect to the specified user
  const formattedBalances = [];

  for (const [otherUserId, balance] of Object.entries(balances)) {
    if (otherUserId !== userId) {
      let balanceDetail = {
        userId: otherUserId,
        userName: userMap[otherUserId].name,
      };

      if (balance > 0) {
        balanceDetail.balance = userId === otherUserId ? -balance : balance;
        balanceDetail.owesUser = userId !== otherUserId;
      } else {
        balanceDetail.balance = -balance;
        balanceDetail.owesUser = userId === otherUserId;
      }

      formattedBalances.push(balanceDetail);
    }
  }

  return formattedBalances;
};

module.exports = calculateBalances;
