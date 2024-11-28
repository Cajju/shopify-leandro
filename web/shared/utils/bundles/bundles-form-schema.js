import { z } from 'zod'
import { REGEX_DECIMAL_NUMBER_POSITIVE } from '../validators.js'
import { BUNDLE_VOLUME_DISCOUNT_TYPES, STATUS_TYPES } from './bundles-constants.js'

// Reusable function to create a number schema that accepts string or number input
const numSchema = (isOptional = true) => {
  let schema = z
    .union([z.string(), z.number()])
    .refine((val) => !val || !isNaN(Number(val)), {
      message: 'Must be a valid number'
    })
    .transform((val) => (val ? Number(val) : undefined))

  return isOptional ? schema.optional() : schema
}

const bundleFormSchema = z.object({
  _id: z.string().optional(),
  status: z.enum([STATUS_TYPES.ACTIVE, STATUS_TYPES.DRAFT]).default(STATUS_TYPES.DRAFT),
  bundleType: z.string(),
  txtBundleName: z.string().min(1, 'Please name your bundle'),
  products: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      image: z.string().optional(),
      variantsCount: z.number(),
      optionsCount: z.number(),
      price: numSchema()
    }),
    { required_error: 'Please select products' }
  ),
  tiers: z.array(
    z.object({
      id: z.string().optional(),
      quantity: z.object({
        type: z
          .union([z.string(), z.array(z.string()).nonempty()])
          .transform((value) => (Array.isArray(value) ? value[0] : value)),
        fixedAmount: numSchema(),
        range: z
          .object({
            min: numSchema(false),
            max: numSchema(false)
          })
          .optional(),
        minAmount: numSchema()
      }),
      discount: z
        .object({
          type: z
            .union([z.string(), z.array(z.string()).nonempty()])
            .transform((value) => (Array.isArray(value) ? value[0] : value)),
          priceOff: numSchema(),
          percentageOff: numSchema(),
          fixedPrice: numSchema()
        })
        .superRefine(({ type, priceOff, percentageOff, fixedPrice }, ctx) => {
          if (type === BUNDLE_VOLUME_DISCOUNT_TYPES.PRICE_OFF) {
            if (!REGEX_DECIMAL_NUMBER_POSITIVE.test(priceOff)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Price must be positive decimal number',
                path: [BUNDLE_VOLUME_DISCOUNT_TYPES.PRICE_OFF]
              })
            }
          } else if (type === BUNDLE_VOLUME_DISCOUNT_TYPES.PERCENTAGE_OFF) {
            if (!REGEX_DECIMAL_NUMBER_POSITIVE.test(percentageOff)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Percentage must be positive decimal number',
                path: [BUNDLE_VOLUME_DISCOUNT_TYPES.PERCENTAGE_OFF]
              })
            } else if (!REGEX_DECIMAL_NUMBER_POSITIVE.test(percentageOff)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Number must be above 0 to 100',
                path: [BUNDLE_VOLUME_DISCOUNT_TYPES.PERCENTAGE_OFF]
              })
            }
          } else if (type === BUNDLE_VOLUME_DISCOUNT_TYPES.FIXED_PRICE) {
            if (!REGEX_DECIMAL_NUMBER_POSITIVE.test(fixedPrice)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Price must be positive decimal number',
                path: [BUNDLE_VOLUME_DISCOUNT_TYPES.FIXED_PRICE]
              })
            }
          }
        }),
      tierText: z.string(),
      ribbon: z
        .object({
          show: z.boolean(),
          text: z.string().optional()
        })
        .refine(({ show, text }) => !show || (show && text.length > 0), {
          path: ['text'],
          message: 'Enter button text'
        })
    })
  ),
  settings: z.object({
    preSelectedTier: z.string(),
    isSingleVariant: z.boolean(),
    showPricePerUnit: z.boolean(),
    txtAddToCart: z.string().min(1, 'Please add button text')
  })
})

export default bundleFormSchema
