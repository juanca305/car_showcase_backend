import Car from "../models/Car.js";

export const getAdminDashboardStats = async (req, res) => {
  try {
    // -----------------------------
    // ✅ Global totals (single query)
    // -----------------------------
    const totalsAgg = await Car.aggregate([
      {
        $group: {
          _id: null,

          totalCars: { $sum: 1 },

          activeCars: {
            $sum: { $cond: [{ $eq: ["$isDeleted", false] }, 1, 0] },
          },
          trashCars: {
            $sum: { $cond: [{ $eq: ["$isDeleted", true] }, 1, 0] },
          },

          visibleCars: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$available", true] }, { $eq: ["$isDeleted", false] }] },
                1,
                0,
              ],
            },
          },
          hiddenCars: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$available", false] }, { $eq: ["$isDeleted", false] }] },
                1,
                0,
              ],
            },
          },

          newCars: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$condition", "new"] }, { $eq: ["$isDeleted", false] }] },
                1,
                0,
              ],
            },
          },
          usedCars: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$condition", "used"] }, { $eq: ["$isDeleted", false] }] },
                1,
                0,
              ],
            },
          },

          certifiedCars: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$certified", true] }, { $eq: ["$isDeleted", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalCars: 1,
          activeCars: 1,
          trashCars: 1,
          visibleCars: 1,
          hiddenCars: 1,
          newCars: 1,
          usedCars: 1,
          certifiedCars: 1,
        },
      },
    ]);

    const totals = totalsAgg?.[0] || {
      totalCars: 0,
      activeCars: 0,
      trashCars: 0,
      visibleCars: 0,
      hiddenCars: 0,
      newCars: 0,
      usedCars: 0,
      certifiedCars: 0,
    };

    // -----------------------------------
    // ✅ Branch breakdown (Active only)
    // -----------------------------------
    const byBranch = await Car.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: "$location.branch",

          activeCars: { $sum: 1 },

          visibleCars: {
            $sum: { $cond: [{ $eq: ["$available", true] }, 1, 0] },
          },
          hiddenCars: {
            $sum: { $cond: [{ $eq: ["$available", false] }, 1, 0] },
          },

          newCars: {
            $sum: { $cond: [{ $eq: ["$condition", "new"] }, 1, 0] },
          },
          usedCars: {
            $sum: { $cond: [{ $eq: ["$condition", "used"] }, 1, 0] },
          },

          certifiedCars: {
            $sum: { $cond: [{ $eq: ["$certified", true] }, 1, 0] },
          },
        },
      },
      { $sort: { activeCars: -1 } },
      {
        $project: {
          _id: 0,
          branch: "$_id",
          activeCars: 1,
          visibleCars: 1,
          hiddenCars: 1,
          newCars: 1,
          usedCars: 1,
          certifiedCars: 1,
        },
      },
    ]);

    return res.status(200).json({
      data: {
        totals,
        byBranch,
      },
    });
  } catch (err) {
    console.error("getAdminDashboardStats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
