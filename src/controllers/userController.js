import * as userService from "../services/userService.js";

export const getUsers = async (req, res) => {
  try {
    const { skip, take, sort, order, search } = req.query;
    const options = {};

    if (skip !== undefined) options.skip = parseInt(skip);
    if (take !== undefined) options.take = parseInt(take);

    if (search) {
      options.where = {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { whatsappNumber: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    if (sort && order) {
      options.orderBy = {
        [sort]: order.toLowerCase() === "desc" ? "desc" : "asc",
      };
    }

    const users = await userService.getUsers(options);
    res.status(200).json({ users });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
