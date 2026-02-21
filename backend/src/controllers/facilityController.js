// Get health facilities
exports.getHealthFacilities = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { district, type } = req.query;

    let facilities;
    if (district) {
      facilities = await sql`
        SELECT * FROM health_facilities
        WHERE district = ${district}
        ORDER BY type DESC, name ASC
      `;
    } else if (type) {
      facilities = await sql`
        SELECT * FROM health_facilities
        WHERE type = ${type}
        ORDER BY district ASC, name ASC
      `;
    } else {
      facilities = await sql`
        SELECT * FROM health_facilities
        ORDER BY district ASC, name ASC
      `;
    }

    res.json({
      success: true,
      data: facilities,
    });
  } catch (error) {
    console.error("Get health facilities error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch health facilities" });
  }
};

// Get facility by ID
exports.getFacilityById = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;

    const facility = await sql`
      SELECT * FROM health_facilities
      WHERE id = ${id}
    `;

    if (facility.length === 0) {
      return res.status(404).json({ success: false, error: "Facility not found" });
    }

    res.json({
      success: true,
      data: facility[0],
    });
  } catch (error) {
    console.error("Get facility error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch facility" });
  }
};
