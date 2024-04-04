import { createContext, useContext } from 'react';

interface ActiveDescendantContextType {
  checkIfActive: (id: string) => boolean;
  onOptionSelect: (id: string, value: unknown) => void;
}

export const ActiveDescendantContext = createContext<
  ActiveDescendantContextType
>({
  checkIfActive: _id => {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        'ActiveDescendantContext was initialized without a Provider! You likely rendered an AutocompleteOption without a parent Autocomplete.'
      );
    }
    return false;
  },
  onOptionSelect: (_id, _value) => {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        'ActiveDescendantContext was initialized without a Provider! You likely rendered an AutocompleteOption without a parent Autocomplete.'
      );
    }
  },
});

export const useActiveDescendantContext = () =>
  useContext(ActiveDescendantContext);
