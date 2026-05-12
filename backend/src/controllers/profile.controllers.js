import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const updateAvatar = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    const file = req.file;

    if (!file.mimetype.startsWith('image/')) {
        throw new ApiError(400, "Only image files are allowed");
    }

    if (file.size > 10 * 1024 * 1024) {
        throw new ApiError(400, "File size must be less than 10MB");
    }

    const cloudinaryResponse = await uploadOnCloudinary(file.path);

    if (!cloudinaryResponse) {
        throw new ApiError(500, "Failed to upload image to Cloudinary");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.avatar = cloudinaryResponse.secure_url;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, "Profile picture updated successfully", {
            avatar: cloudinaryResponse.secure_url,
            user: {
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatar: user.avatar,
                isEmailVerified: user.isEmailVerified,
                starredProjects: user.starredProjects,
            }
        })
    );
});

export { updateAvatar };
