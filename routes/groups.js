const express = require("express");
const router = express.Router();
const Group = require("../models/group");
const Expense = require("../models/expense");
const User = require("../models/user");
const calculateBalances = require("../utils/balanceCalculator");

// @route    POST api/groups
// @desc     Create a group with members
// @access   Public
router.post("/", async (req, res) => {
  const { name, members } = req.body;

  try {
    const newGroup = new Group({ name, members });
    const group = await newGroup.save();
    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/groups/:groupId/expenses
// @desc     Add an expense to a group
// @access   Public
router.post("/:groupId/expenses", async (req, res) => {
  const { description, amount, payer, participants } = req.body;
  const { groupId } = req.params;

  try {
    const newExpense = new Expense({
      description,
      amount,
      payer,
      participants,
      group: groupId,
    });

    const expense = await newExpense.save();
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/groups
// @desc     Get all groups
// @access   Public
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find().populate("members");
    res.json(groups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/groups/:groupId/expenses
// @desc     Get all expenses in a specific group
// @access   Public
router.get("/:groupId/expenses", async (req, res) => {
  const { groupId } = req.params;

  try {
    const expenses = await Expense.find({ group: groupId })
      .populate("payer")
      .populate("participants");
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/groups/:groupId/members
// @desc     Get all members in a specific group
// @access   Public
router.get("/:groupId/members", async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId).populate("members");
    if (!group) return res.status(404).json({ msg: "Group not found" });

    res.json(group.members);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/groups/:groupId/balance/:userId
// @desc     Get balance for a specific user in a group
// @access   Public
router.get("/:groupId/balance/:userId", async (req, res) => {
  const { groupId, userId } = req.params;

  try {
    const expenses = await Expense.find({ group: groupId });
    const formattedBalances = await calculateBalances(expenses, userId);
    res.json(formattedBalances);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// @route    DELETE api/groups/:groupId
// @desc     Delete a group and its associated expenses
// @access   Public
router.delete("/:groupId", async (req, res) => {
  const { groupId } = req.params;

  try {
    // Delete all expenses associated with the group
    await Expense.deleteMany({ group: groupId });

    // Delete the group
    const group = await Group.findByIdAndDelete(groupId);

    if (!group) return res.status(404).json({ msg: "Group not found" });

    res.json({ msg: "Group and associated expenses deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// @route    PUT api/groups/:groupId
// @desc     Update the name of a group
// @access   Public
router.put("/:groupId", async (req, res) => {
  const { groupId } = req.params;
  const { name } = req.body;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    group.name = name;
    await group.save();

    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


module.exports = router;
