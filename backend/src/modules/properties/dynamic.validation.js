import prisma from '../../config/prisma.js';

export class DynamicValidationError extends Error {
  constructor(errors) {
    super('Dynamic attribute validation failed');
    this.name = 'DynamicValidationError';
    this.errors = errors;
    this.statusCode = 422;
  }
}

const PRIMITIVE_PARSERS = {
  number: (value, field) => {
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
    throw new TypeError(`Field "${field}" must be a valid number`);
  },

  string: (value, field) => {
    if (typeof value === 'string') return value.trim();
    if (value !== null && value !== undefined) return String(value).trim();
    throw new TypeError(`Field "${field}" must be a string`);
  },

  boolean: (value, field) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.trim().toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
    }
    if (typeof value === 'number') return value !== 0;
    throw new TypeError(`Field "${field}" must be a boolean`);
  },

  date: (value, field) => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    throw new TypeError(`Field "${field}" must be a valid date`);
  },
};

export function validateDynamicAttributes(attributes, schemaRules) {
  if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes)) {
    throw new DynamicValidationError([
      { field: 'attributes', message: 'Attributes must be a non-null object' },
    ]);
  }

  if (!Array.isArray(schemaRules) || schemaRules.length === 0) {
    return { valid: true, sanitized: { ...attributes } };
  }

  const errors = [];
  const sanitized = { ...attributes };

  for (const rule of schemaRules) {
    const { field, type, required } = rule;
    const rawValue = attributes[field];
    const isPresent = rawValue !== undefined && rawValue !== null && rawValue !== '';

    if (required && !isPresent) {
      errors.push({ field, message: `Field "${field}" is required`, type: 'REQUIRED' });
      continue;
    }

    if (!isPresent) {
      delete sanitized[field];
      continue;
    }

    const parser = PRIMITIVE_PARSERS[type];

    if (parser) {
      try {
        sanitized[field] = parser(rawValue, field);
      } catch (err) {
        errors.push({ field, message: err.message, type: 'INVALID_TYPE' });
      }
    } else {
      sanitized[field] = rawValue;
    }
  }

  if (errors.length > 0) {
    throw new DynamicValidationError(errors);
  }

  return { valid: true, sanitized };
}

export function validateListingAttributes() {
  return async (req, res, next) => {
    try {
      const categoryId = req.body.categoryId;

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          error: 'categoryId is required',
        });
      }

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: `Category with id "${categoryId}" not found`,
        });
      }

      req.category = category;

      const rawAttributes = req.body.attributes || {};
      const hasRules =
        category.schemaRules &&
        Array.isArray(category.schemaRules) &&
        category.schemaRules.length > 0;

      if (hasRules) {
        const { sanitized } = validateDynamicAttributes(rawAttributes, category.schemaRules);
        req.body.attributes = sanitized;
      } else {
        req.body.attributes = rawAttributes;
      }

      next();
    } catch (err) {
      if (err instanceof DynamicValidationError) {
        return res.status(err.statusCode).json({
          success: false,
          error: err.message,
          details: err.errors,
        });
      }
      next(err);
    }
  };
}
