<template>
    <div class="custom-select" @click="toggleDropdown">
      <div class="select-container">
        <label class="input-label" :class="{ hidden: !label }">
          {{ computedLabel || '\u00A0' }}
        </label>
  
        <div class="select-wrapper">
          <!-- Отображение выбранного элемента или placeholder -->
          <div class="selected-value" :class="{ 'selected': selectedLabel }">
            {{ selectedLabel || placeholder }}
          </div>
          <!-- Стрелочка -->
          <span class="dropdown-icon material-symbols-outlined">
            arrow_drop_down
          </span>
        </div>
  
        <!-- Выпадающий список -->
        <ul v-if="isDropdownOpen" class="dropdown-list">
          <li
            v-for="(item, index) in dropdownItems"
            :key="index"
            class="dropdown-item"
            @click.stop="selectItem(item)"
          >
            {{ getItemLabel(item) }}
          </li>
        </ul>
      </div>
    </div>
</template>
  
<script>
  export default {
  data() {
    return {
      isDropdownOpen: false,
      dynamicLabel: this.label,
    };
  },
  props: {
    label: {
      type: String,
      default: "",
    },
    items: {
      type: Array,
      required: true,
    },
    labelKey: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: "Select an option",
    },
    value: {
      type: [String, Object, null],
      default: null,
    },
  },
  computed: {
    computedLabel() {
      return this.dynamicLabel || null;
    },
    dropdownItems() {
      return ["Все", ...this.items];
    },
    selectedLabel() {
      return this.value ? this.getItemLabel(this.value) : null;
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.$nextTick(() => {
          this.updateSelected(newVal);
          this.updateDynamicLabel(newVal);
        });
      },
    },
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    selectItem(item) {
      const newValue = item === "Все" ? null : item; // Если выбрано Все то сбрасываем значение
      this.$emit("input", newValue); // Передаем новое значение
      this.updateDynamicLabel(newValue);
      this.isDropdownOpen = false;
    },
    getItemLabel(item) {
      if (this.labelKey && typeof item === "object") {
        return item[this.labelKey] || "Все";
      }
      return item;
    },
    updateSelected(newVal) {
      if (newVal && this.items.includes(newVal)) {
        this.selectedItem = newVal;
      } else {
        this.selectedItem = null;
      }
    },
    updateDynamicLabel(newValue) {
      this.dynamicLabel = newValue ? this.placeholder : this.label;
    },
    handleDocumentClick(event) {
      if (!this.$el.contains(event.target)) {
        this.isDropdownOpen = false;
      }
    },
  },
  mounted() {
    this.updateDynamicLabel(this.value);
    document.addEventListener("click", this.handleDocumentClick);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleDocumentClick);
  },
};

</script>
  
  <style scoped lang="scss">
  @import '../styles/variables';
  
  .custom-select {
    position: relative;
    width: 100%;
    cursor: pointer;
  
    .select-container {
      display: grid;
      grid-template-rows: auto auto;
      grid-template-columns: min-content auto;
      border-bottom: 2px solid $gray-3;
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
    }
  
    .select-wrapper {
      display: flex;
      grid-row: 2;
      grid-column: 2;
      border: none;
      justify-content: space-between;
      align-items: center;
      border-radius: 4px;
      padding: 6.5px 12px;
      transition: border-color 0.3s;
  
      &:hover {
        border-color: $light-green-color;
      }
    }
  
    .selected-value {
      color: $gray;
      font-size: 1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &.selected {
        color: black;  // Цвет для выбранной опции
      }
    }
  
    .dropdown-icon {
      color: $gray-4;
      font-size: 24px;
      transition: transform 0.3s;
    }
  
    &.open .dropdown-icon {
      transform: rotate(180deg);
    }
  
    .dropdown-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-top: 4px;
      list-style: none;
      padding: 0;
      max-height: 200px;
      overflow-y: auto;
      z-index: 10;
  
      .dropdown-item {
        padding: 8px 12px;
        cursor: pointer;
        transition: background-color 0.2s;
  
        &:hover {
          background-color: $primary-color;
        }
      }
    }
  }
</style>
  