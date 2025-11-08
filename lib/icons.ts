'use client'

// Centralizar importación de iconos de Font Awesome
// Esto permite tree-shaking y reduce el tamaño del bundle

import {
  faSearch,
  faHome,
  faCompass,
  faUser,
  faSignOutAlt,
  faSignInAlt,
  faHeart,
  faStar,
  faPlay,
  faCalendar,
  faTv,
  faFilm,
  faFire,
  faTrophy,
  faUsers,
  faComment,
  faThumbsUp,
  faEye,
  faEyeSlash,
  faPlus,
  faTimes,
  faCheck,
  faBars,
  faChevronDown,
  faChevronUp,
  faFilter,
  faSort,
  faShareAlt,
  faBookmark,
  faCircle,
} from '@fortawesome/free-solid-svg-icons'

import {
  faHeart as faHeartRegular,
  faBookmark as faBookmarkRegular,
  faStar as faStarRegular,
} from '@fortawesome/free-regular-svg-icons'

// Exportar todos los iconos usados en la app
export const icons = {
  // Navegación
  search: faSearch,
  home: faHome,
  compass: faCompass,
  user: faUser,
  bars: faBars,

  // Auth
  signOut: faSignOutAlt,
  signIn: faSignInAlt,

  // Acciones
  heart: faHeart,
  heartRegular: faHeartRegular,
  star: faStar,
  starRegular: faStarRegular,
  play: faPlay,
  thumbsUp: faThumbsUp,
  shareAlt: faShareAlt,
  bookmark: faBookmark,
  bookmarkRegular: faBookmarkRegular,

  // Info
  calendar: faCalendar,
  tv: faTv,
  film: faFilm,
  eye: faEye,
  eyeSlash: faEyeSlash,

  // Destacados
  fire: faFire,
  trophy: faTrophy,
  users: faUsers,

  // UI
  comment: faComment,
  plus: faPlus,
  times: faTimes,
  check: faCheck,
  chevronDown: faChevronDown,
  chevronUp: faChevronUp,
  filter: faFilter,
  sort: faSort,
  circle: faCircle,
}

// Tipo para autocompletado
export type IconName = keyof typeof icons

