<template>
  <div class="custom-input">
    <div class="input-wrapper">
      <!-- Иконка -->
      <span v-if="icon" class="input-icon material-symbols-outlined">
        {{ icon }}
      </span>

      <!-- Заголовок -->
      <label class="input-label" :class="{ hidden: !displayedLabel }">
        {{ displayedLabel || '\u00A0' }}
      </label>

      <!-- Поле ввода или текстовая область -->
      <component
        :is="inputTag"
        :placeholder="computedPlaceholder"
        :type="computedType"
        v-bind="inputProps"
        @input="handleInput"
        class="input-element"
      >
        <template v-if="inputTag === 'textarea' && value !== ''">{{value}}</template>
      </component>

      <!-- Кнопка для показа/скрытия пароля -->
      <button
        v-if="type === 'password'"
        class="toggle-password-btn"
        @click.prevent="togglePasswordVisibility"
        type="button"
        aria-label="Toggle password visibility"
      >
        <span class="material-symbols-outlined">
          {{ isPasswordVisible ? 'visibility_off' : 'visibility' }}
        </span>
      </button>

      <!-- Кнопка поиска -->
      <button
        v-if="type === 'search'"
        class="search-btn"
        @click.prevent="onSearchClick"
        type="button"
        aria-label="Search"
      >
        <span class="material-symbols-outlined">search</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isPasswordVisible: false,
      displayedLabel: this.label,
    };
  },
  props: {
    label: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "text",
    },
    value: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    onSearch: {
      type: Function,
      default: null,
    },
  },
  computed: {
    inputTag() {
      // Определяем input или textarea
      return this.type === "textarea" ? "textarea" : "input";
    },
    computedType() {
      return this.type === "password"
        ? this.isPasswordVisible
          ? "text"
          : "password"
        : this.type;
    },
    computedPlaceholder() {
      // Показываем placeholder если текст пустой
      return this.value ? "" : this.placeholder;
    },
    inputProps() {
      const props = { placeholder: this.computedPlaceholder };
      if (this.inputTag !== "textarea") {
        props.value = this.value;
      }
      return props;
    },
  },
  watch: {
    // Следим за полем и обновляем label
    value(newValue) {
      this.updateLabel(newValue);
    },
  },
  methods: {
    handleInput(event) {
      this.$emit("input", event.target.value);
      this.updateLabel(event.target.value);
    },
    togglePasswordVisibility() {
      this.isPasswordVisible = !this.isPasswordVisible;
    },
    onSearchClick() {
      if (this.onSearch) {
        this.onSearch(this.value);
      } else {
        this.$emit("search", this.value);
      }
    },
    updateLabel(value) {
      this.displayedLabel = value ? this.label || this.placeholder : this.label;
    },
  },
  mounted() {
    // label при загрузке
    this.updateLabel(this.value);
  },
};
</script>


<style scoped lang="scss">

.input-wrapper {
  display: grid;
  grid-template-columns: auto 1fr auto;
  column-gap: 8px;
  grid-template-rows: auto auto;

  border-bottom: 2px solid $gray-3;
  width: 100%;
  transition: border-color 0.3s;

  &:focus-within {
    border-color: $light-green-color;
  }
}

.input-label {
  grid-row: 1;
  grid-column: 2;

  text-align: left;
  color: $light-green-color;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;

  &.hidden {
    visibility: hidden; /* Скрывает текст, но сохраняет место */
  }
}

.input-icon {
  grid-column: 1;
  grid-row: 2;
  align-content: center;
  color: $gray-4;
}

.input-container {
  grid-column: 2;
  display: grid;
}

.input-element {
  grid-column: 2;
  grid-row: 2;

  border: none;
  outline: none;
  flex: 1;
  font-size: 1rem;
  color: $gray-5;
  padding: 0;
  height: 37px;
  width: 100%;
  resize: none; /* Убирает возможность изменения размеров для textarea */

  &::placeholder {
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    color: $gray;
  }
}

textarea {
  min-height: 80px; /* Для textarea устанавливаем минимальную высоту */
}

.toggle-password-btn {
  grid-column: 3;
  grid-row: 2;

  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: $gray-4;

  &:hover {
    color: $gray-5;
  }

  .material-symbols-outlined {
    font-size: 24px;
  }
}

.search-btn {
  grid-column: 3;
  grid-row: 2;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: $gray-4;

  &:hover {
    color: $gray-5;
    background-color: transparent;

  }

  .material-symbols-outlined {
    font-size: 24px;
  }
}
</style>