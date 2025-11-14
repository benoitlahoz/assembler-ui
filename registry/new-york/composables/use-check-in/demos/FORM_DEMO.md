# Form Demo - useCheckIn

Cette démo illustre comment utiliser `useCheckIn` pour créer un formulaire où :

## Architecture

### Parent (FormDemo.vue)
Le composant parent **ouvre un desk** avec `openDesk()` qui fournit :
- ✅ Gestion centralisée des valeurs du formulaire
- ✅ Gestion centralisée des erreurs de validation
- ✅ Fonctions partagées : `updateValue()`, `getValue()`, `setError()`, `getError()`

```typescript
const { openDesk } = useCheckIn();

const desk = openDesk(FormDesk, {
  extraContext: {
    updateValue: (name: string, value: any) => { /* ... */ },
    getValue: (name: string) => formData.value[name],
    setError: (name: string, error: string) => { /* ... */ },
    getError: (name: string) => errors.value[name],
  },
  onCheckIn: (id, data) => {
    // Initialiser les valeurs par défaut
  },
});
```

### Enfants (FormField.vue)
Les composants enfants **s'enregistrent au desk** avec `checkIn()` :
- ✅ Auto-enregistrement au montage
- ✅ Auto-désenregistrement au démontage
- ✅ Synchronisation bidirectionnelle des valeurs
- ✅ Accès aux erreurs depuis le parent

```typescript
const { checkIn } = useCheckIn();

const { desk: formDesk } = checkIn(FormDesk, {
  required: true,
  autoCheckIn: true,
  id: props.name,
  data: () => ({
    name: props.name,
    label: props.label,
    value: props.value,
    required: props.required,
  }),
});
```

## Fonctionnalités

- 📝 Types de champs : text, email, number, textarea, select, checkbox
- ✅ Validation centralisée
- 🔄 Synchronisation automatique des valeurs
- ⚠️ Gestion des erreurs
- 🎯 Champs requis
- 🔄 Réinitialisation du formulaire

## Flux de données

```
FormDemo (parent)
    ↓ openDesk()
    ├─ formData (state centralisé)
    ├─ errors (validation centralisée)
    └─ Fonctions partagées
          ↓
    ┌─────┴─────┬─────┬─────┐
    ↓           ↓     ↓     ↓
FormField   FormField  ...  FormField
(enfants qui s'enregistrent via checkIn())
```

## Exemple d'utilisation

```vue
<FormDemo>
  <FormField name="username" label="Username" :required="true" />
  <FormField name="email" label="Email" type="email" :required="true" />
  <FormField name="bio" label="Bio" type="textarea" />
</FormDemo>
```

Chaque champ s'enregistre automatiquement et communique avec le formulaire parent via le desk ! 🎯
