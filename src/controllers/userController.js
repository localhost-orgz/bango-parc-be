import * as userService from "../services/userService.js";

export const getUsers = async (req, res) => {
  try {
    const { skip, take, sort, order, search, role } = req.query;
    const options = {};

    if (skip !== undefined) options.skip = parseInt(skip);
    if (take !== undefined) options.take = parseInt(take);

    // Build where clause for search and role
    let where = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { whatsappNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      if (where.OR) {
        where.AND = [{ role: role }];
      } else {
        where.role = role;
      }
    }

    if (Object.keys(where).length > 0) {
      options.where = where;
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

export const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId parameter" });
    }

    const userDetail = await userService.getUserDetail(Number(userId));
    res.status(200).json({ user: userDetail });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
