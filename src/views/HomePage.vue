<template>
  <div class="home-page">
    <header>
      <h1>Список заявок</h1>
    </header>

    <body class="table-body">
      <div class="create-button-container">
        <button @click="createAppeal">Создать</button>
      </div>

      <!-- Верхние фильтры -->
      <div class="first-filters-container">
        <!-- фильтр по id -->
        <CustomInput
          placeholder="Поиск (№ заявки, название)"
          type="search"
          v-model="searchQuery"
          :onSearch="applyFilters"
        />
        <!-- фильтр по домам-->
        <CustomSelect
          :items="premiseAddresses"
          placeholder="Дом"
          v-model="selectedPremise"
          labelKey="address"
        />
      </div>

      <!-- таблица -->
      <table class="appeals-table">
        <thead>
          <tr>
            <th @click="toggleSort('number')" style="cursor: pointer;">
              №
              <span>
                <i
                  :class="sortDirection === '-number' ? 'arrow-up' : 'arrow-down'"
                  v-if="sortDirection.includes('number')"
                >
                  {{ sortDirection === '-number' ? '↑' : '↓' }}
                </i>
                <i v-else class="arrow-neutral">↕</i>
              </span>
            </th>
            <th @click="toggleSort('created_at')" style="cursor: pointer;">
              Создана
              <span>
                <i
                  :class="sortDirection === '-created_at' ? 'arrow-up' : 'arrow-down'"
                  v-if="sortDirection.includes('created_at')"
                >
                  {{ sortDirection === '-created_at' ? '↑' : '↓' }}
                </i>
                <i v-else class="arrow-neutral">↕</i>
              </span>
            </th>
            <th>Адрес</th>
            <th>Заявитель</th>
            <th>Описание</th>
            <th>Срок</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="appeal in appeals"
            :key="appeal.id"
            @click="openAppeal(appeal)"
          >
            <td class="table-number">
              <span class="number-content">{{ appeal.number }}</span>
            </td>
            <td>{{ formatDate(appeal.created_at) }}</td>
            <td>{{ formatAddress(appeal.premise, appeal.apartment) }}</td>
            <td>{{ formatApplicant(appeal.applicant) }}</td>
            <td>{{ appeal.description }}</td>
            <td>{{ formatDate(appeal.due_date) }}</td>
            <td>{{ appeal.status.name }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Нижние фильтры -->
      <div class="secont-filters-container">
        <div class="indo-pagesize">
          <div class="record-info">
            <p>{{ displayRecordInfo }}</p>
          </div>

          <select v-model="pageSize" @change="togglePageSize">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>

        <!-- Пагинация -->
        <div class="pagination">
          <!-- Кнопка "Первая страница" -->
          <span 
            class="page-item material-symbols-outlined"
            @click="goToPage(1)"
            :class="{'disabled': currentPage === 1}"
          >
            keyboard_double_arrow_left
          </span>

          <!-- Кнопка "Предыдущая" -->
          <span 
            class="page-item material-symbols-outlined"
            @click="goToPage(currentPage - 1)"
            :class="{'disabled': currentPage === 1}"
          >
            keyboard_arrow_left
          </span>

          <!-- Первая страница и остальные страницы -->
          <span
            v-for="item in getPagesToShow"
            :key="item.key"
            @click="goToPage(item.page)"
            :class="['page-item', { 'active': item.page === currentPage }]"
          >
            {{ item.page }}
          </span>

          <!-- Кнопка "Следующая" -->
          <span
            class="page-item material-symbols-outlined"
            @click="goToPage(currentPage + 1)"
            :class="{'disabled': currentPage === totalPages}"
          >
            keyboard_arrow_right
          </span>

          <!-- Кнопка "Последняя страница" -->
          <span 
            class="page-item material-symbols-outlined"
            @click="goToPage(totalPages)"
            :class="{'disabled': currentPage === totalPages}"
          >
            keyboard_double_arrow_right
          </span>
        </div>
      </div>

      <!-- Модальное окно -->
      <ModalWindow
        v-if="isModalOpen"
        :selectedAppeal="selectedAppeal"
        @save="handleSave"
        @close="closeModal"
        @data-saved="dataUpdate"
      />
    </body>
  </div>
</template>

<script>
import CustomInput from "@/components/CustomInput.vue";
import CustomSelect from "@/components/CustomSelect.vue";
import ModalWindow from "@/components/ModalWindow.vue";

export default {
  data() {
    return {
      selectedAppeal: null, // Выбранная заявка для модального окна
      searchQuery: "", // Строка поиска
      pageSize: 10, // Количество строк на странице
      currentPage: 1, // Текущая страница
      sortDirection: '-number', // Направление сортировки по id
      selectedPremise: null, //Фильтр по домам
      isModalOpen: false, // Модальное окно

    };
  },
  components: { CustomInput, CustomSelect, ModalWindow },
  watch: {
    selectedPremise(newPremise) {
      if (newPremise) {
        this.applyFilters();
      } else {
        this.selectedApartment = null;
        this.applyFilters();
      }
    },
  },
  computed: {
    appeals() {
      return this.$store.getters.appeals;
    },
    userPremises() {
      return this.$store.getters.userPremises; // Получаем список домов из Vuex
    },
    premiseAddresses() {
      return this.userPremises.map((premise) => ({
        id: premise.id,
        address: premise.address,
      }));
    },
    totalPages() {
      return this.$store.getters.totalPages; // Получаем общее число страниц из Vuex
    },
    displayRecordInfo() { // Вывод сколько записей на странице
      const start = (this.currentPage - 1) * this.pageSize + 1;

      const totalRecords = this.$store.getters.totalCount;
      const end = Math.min(this.currentPage * this.pageSize, totalRecords);
      return `${start}-${end} из ${totalRecords} записей`;
    },
    getPagesToShow() {
      const totalPages = this.totalPages;
      const currentPage = this.currentPage;
      const pages = [];
      const MAX_VISIBLE = 7; // Максимум 7 элементов

      if (totalPages <= MAX_VISIBLE) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push({ page: i, key: `page-${i}` });
        }
        return pages;
      }

      pages.push({ page: 1, key: "first" });

      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          pages.push({ page: i, key: `page-${i}` });
        }
        pages.push({ page: "...", key: "ellipsis-start" });
        pages.push({ page: totalPages, key: "last" });
        return pages;
      }

      if (currentPage >= totalPages - 3) {
        pages.push({ page: "...", key: "ellipsis-start" });
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push({ page: i, key: `page-${i}` });
        }
        return pages;
      }

      pages.push({ page: "...", key: "ellipsis-start" });
      pages.push({ page: currentPage - 1, key: `page-${currentPage - 1}` });
      pages.push({ page: currentPage, key: `page-${currentPage}` });
      pages.push({ page: currentPage + 1, key: `page-${currentPage + 1}` });
      pages.push({ page: "...", key: "ellipsis-end" });
      pages.push({ page: totalPages, key: "last" });

      return pages;
    },
  },
  methods: {
    openAppeal(appeal) { // Событие для редактирования
      this.selectedAppeal = appeal;
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.selectedAppeal = null;
    },
    dataUpdate() { // Обновляем данные
      this.applyFilters();
      this.$store.dispatch("fetchUserPremises");
    },
    createAppeal() { // Кнопка создать
      this.selectedAppeal = null;
      this.isModalOpen = true;
    },
    handleSave(data) {
      if (this.selectedAppeal) {
        // Обновление заявки
        this.$store.dispatch("updateAppeal", data);
      } else {
        // Создание новой заявки
        this.$store.dispatch("createAppeal", data);
      }
      this.isModalOpen = false;
    },


    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    formatAddress(premise, apartment) {
      return `${premise?.address || "Нет данных"}, ${apartment?.label || "Нет данных"}`;
    },
    formatApplicant(applicant) {
      return `${applicant?.last_name || "—"} ${applicant?.first_name || ""} ${applicant?.patronymic_name || ""}`;
    },

    async goToPage(page) {
      if (page === "...") return;
      if (page < 1) page = 1;
      if (page > this.totalPages) page = this.totalPages;

      this.currentPage = page;
      await this.applyFilters();
    },
    async applyFilters() {
      try {
        if (this.searchQuery.trim() !== "") {
          this.currentPage = 1;
        }

        const filters = {
          search: this.searchQuery.trim(),
          pageSize: this.pageSize,
          page: this.currentPage,
          sort: this.sortDirection,
          premise_id:  this.selectedPremise ? this.selectedPremise.id : null,
        };

        await this.$store.dispatch("fetchFilteredAppeals", filters);
      } catch (error) {
        console.error("Ошибка применения фильтров:", error);
        alert("Не удалось применить фильтры");
      }
    },
    toggleSort(sort) { // Смена сортировки
      if (this.sortDirection === sort) {
        this.sortDirection = `-${sort}`;
      } else if (this.sortDirection === `-${sort}`) {
        this.sortDirection = sort;
      } else {
        this.sortDirection = sort;
      }
      this.applyFilters();
    },
    togglePageSize() { // Возвращаемся на первую страницу при изменении отображаемого кол-ва
      this.currentPage = 1;
      this.applyFilters();
    },
  },
  created() {
    this.applyFilters();
    this.$store.dispatch("fetchUserPremises");
  },
};
</script>

<style scoped lang="scss">
.home-page {
  background-color: $gray-2;
}

.table-body {
  display: flex;
  flex-direction: column;
  gap: 32px;

  background-color: $primary-color;
  padding: 10px 20px;
}

.create-button-container {
  display: flex;
  justify-content: end;

  button {
    padding: 7px 16px;
  }
}

.first-filters-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.appeals-table th {
  color: $light-green-color;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
}

.appeals-table {
  width: 100%;
  border-collapse: collapse;
}

.appeals-table tbody tr {
  border-bottom: 2px solid $gray-3;
}

.table-number {
  padding: 0; /* Убираем отступы для ячейки, чтобы они не конфликтовали */
}

.appeals-table td {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis; /* Показывает многоточие для длинного текста */
  font-size: 14px;
  padding: 19px 8px;
}

.table-number .number-content {
  background-color: $light-green-color;
  color: $primary-color;
  padding: 4px 14px; /* Внутренние отступы для содержимого номера */
  border-radius: 4px;
  display: inline-block; /* Чтобы фон подстраивался только под содержимое */
}

select {
  -webkit-appearance: none;
  -moz-appearance: none;
  
  background: transparent;
  background-image: url('data:image/svg+xml,%3Csvg%20fill%3D%27%23999999%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%20width%3D%2724%27%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%27M7%2010l5%205%205-5z%27%2F%3E%3Cpath%20d%3D%27M0%200h24v24H0z%27%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E');

  background-repeat: no-repeat;
  background-position-x: 100%;
  background-position-y: 50%;

  border: none;
  border-bottom: 2px solid $gray-3;
  padding: 8px 30px 8px 8px;
  outline: none;
  height: 30px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 20px;
}

.pagination .active {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  width: 32px;
  height: 32px;

  color: $primary-color;
  background-color: $light-green-color;
  border-radius: 50px;
  box-shadow: 0px 4px 4px rgba(106, 174, 94, 0.25);
}

.secont-filters-container {
  display: flex;
  justify-content: space-between;
}

.indo-pagesize {
  display: flex;
  align-items: center;
  gap: 16px;
}












.page-item {
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}

.pagination button {
  padding: 5px 10px;
  border: 1px solid $gray-2;
  background-color: $primary-color;
  cursor: pointer;
}
.pagination button:disabled {
  background-color: $primary-color;
  cursor: not-allowed;
}

</style>
