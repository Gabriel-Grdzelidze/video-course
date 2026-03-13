import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  permissions: [
    {
      type: String,
      enum: [
        "manage_users",
        "manage_courses",
        "manage_instructors",
        "manage_payments",
        "manage_categories",
        "view_analytics",
      ],
    },
  ],
  isSuperAdmin: {
    type: Boolean,
    default: false,
  },
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export default Admin;