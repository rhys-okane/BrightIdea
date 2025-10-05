This app is a React v19 app using Tailwind CSS v4 and Vite. It is named `Bright Idea`, a web application for creating designs and animations for a grid of LEDs on the front of a helmet.

Where possible, use the latest React features and best practices. 

Each component should be a single file. The file structure should be relevant to the component's functionality, and the file name should match the component name.

All files in the project should be named using PascalCase and all folders named in kebab-case.

Avoid the use of fragments unless absolutely necessary.

Use memos and callbacks where appropriate to optimize performance, especially in components that receive props or have complex logic.

A zustand store is used for state management. When creating a new store, follow the pattern of the existing stores in the `src/store` directory.
You should create a `use` hook for each store, which returns the state and the setter function, akin to that of default React state.

When creating a component, use the syntax
```tsx
import { FC } from 'react';

// If props are required, call the interface Props and add it to the FC type
interface Props {
  // ...
}

// or FC<Props> if you have props
export const ComponentName: FC = () => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};
```