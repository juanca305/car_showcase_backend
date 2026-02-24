import Car from "../models/Car.js";

function slugify(str = "") {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export const toggleCarVisibility = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await Car.findById(id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    const nextAvailable = !car.available;

    // ✅ If we are about to PUBLISH (make it visible)
    if (nextAvailable === true) {
      // 1) Must have at least 1 image
      if (!car.images || car.images.length === 0) {
        return res.status(400).json({
          message: "Upload at least 1 image before publishing.",
        });
      }

      // 2) Must have exactly one main (at least one main)
      const hasMain = car.images.some((img) => img.angle === "main");
      if (!hasMain) {
        return res.status(400).json({
          message: "Set a main image before publishing.",
        });
      }

      // 3) Ensure slug exists (recommended: require year)
      if (!car.year || !car.make || !car.model) {
        return res.status(400).json({
          message: "Make, model, and year are required before publishing.",
        });
      }

      if (!car.slug) {
        const baseSlug = slugify(`${car.make}-${car.model}-${car.year}`);

        // ✅ Avoid duplicates (rare but possible)
        let finalSlug = baseSlug;
        let i = 2;

        while (await Car.exists({ slug: finalSlug, _id: { $ne: car._id } })) {
          finalSlug = `${baseSlug}-${i}`;
          i++;
        }

        car.slug = finalSlug;
      }
    }

    // ✅ Toggle available
    car.available = nextAvailable;
    await car.save();

    return res.status(200).json({
      message: `Car is now ${car.available ? "Visible" : "Hidden"}`,
      data: car,
    });
  } catch (err) {
    console.error("toggleCarVisibility error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/cars/:id/publish
export const publishCar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid car id" });
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (car.isDeleted) {
      return res.status(400).json({ message: "Car is deleted" });
    }

    if (!car.images || car.images.length === 0) {
      return res.status(400).json({
        message: "Upload at least one image before publishing",
      });
    }

    if (car.available) {
      return res.status(200).json({
        message: "Car already published",
        data: car,
      });
    }

    car.available = true;
    await car.save();

    return res.status(200).json({
      message: "Car published successfully",
      data: car,
    });
  } catch (err) {
    console.error("publishCar error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

