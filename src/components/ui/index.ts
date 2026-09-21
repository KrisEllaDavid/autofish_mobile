/**
 * AutoFish UI primitives.
 *
 * The shared vocabulary every screen builds from. Styling lives in
 * src/styles/components.css; tokens in src/styles/tokens.css.
 */

export { default as Button } from "./Button";
export type { ButtonProps } from "./Button";

export {
  default as TextField,
  TextField as Input,
  PasswordField,
  TextArea,
  Checkbox,
} from "./Field";
export type { TextFieldProps, TextAreaProps, CheckboxProps } from "./Field";

export {
  EmptyState,
  Skeleton,
  PostCardSkeleton,
  ListRowSkeleton,
  Banner,
  Spinner,
} from "./Feedback";
export type { EmptyStateProps, SkeletonProps, BannerProps } from "./Feedback";

export { Avatar, Card, Chip, IconButton, ListRow } from "./Surfaces";
export type {
  AvatarProps,
  CardProps,
  ChipProps,
  IconButtonProps,
  ListRowProps,
} from "./Surfaces";

export { theme, color, space, radius, font, text, weight, shadow, motion, layout, z } from "../../styles/theme";
