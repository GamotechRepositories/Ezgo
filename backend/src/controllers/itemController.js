import Item from '../models/Item.js';

const EDITABLE_FIELDS = ['name', 'category', 'specs', 'dailyRate', 'isAvailable', 'condition', 'image'];

const pickEditable = (body) =>
  Object.fromEntries(EDITABLE_FIELDS.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));

// @desc    Get all items (optionally for one provider)
// @route   GET /api/items?providerId=
const ownsItem = (req, item) =>
  req.user.role === 'admin' || item.providerId?.toString() === req.user._id.toString();

export const getItems = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'provider') {
      res.status(403);
      throw new Error('Only a vendor can view equipment.');
    }
    const filter = req.user.role === 'admin'
      ? (req.query.providerId ? { providerId: req.query.providerId } : {})
      : { providerId: req.user._id };
    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
export const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }
    if (!ownsItem(req, item)) {
      res.status(403);
      throw new Error('You can only view your own equipment.');
    }
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new item
// @route   POST /api/items
export const createItem = async (req, res, next) => {
  try {
    const providerId = req.user.role === 'admin' ? req.body.providerId : req.user._id;
    if (!providerId) {
      res.status(400);
      throw new Error('providerId is required');
    }
    const item = await Item.create({ ...pickEditable(req.body), providerId });
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
export const updateItem = async (req, res, next) => {
  try {
    const existing = await Item.findById(req.params.id);
    if (!existing) {
      res.status(404);
      throw new Error('Item not found');
    }
    if (!ownsItem(req, existing)) {
      res.status(403);
      throw new Error('You can only update your own equipment.');
    }
    const item = await Item.findByIdAndUpdate(req.params.id, pickEditable(req.body), {
      new: true,
      runValidators: true,
    });
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
export const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }
    if (!ownsItem(req, item)) {
      res.status(403);
      throw new Error('You can only remove your own equipment.');
    }
    await item.deleteOne();
    res.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
