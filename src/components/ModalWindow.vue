<template>
  <div class="modal" @mousedown.self="closeModal">
    <div class="modal-content">
      <div class="modal-container">
        <header>
          <h2>
            {{ selectedAppeal ? `Заявка №${selectedAppeal.number} (от ${formatDate(selectedAppeal.created_at)})` : "Создание заявки" }}
          </h2>

          <label>
            {{ selectedAppeal ? selectedAppeal.status.name : "Новая" }}
          </label>
        </header>

        <body class="grid-container">
          <CustomSelect
            :items="premiseAddresses"
            placeholder="Дом"
            v-model="selectedPremise"
            style="grid-column: 1 / 5; grid-row: 1;"
            labelKey="address"
          />
          <CustomSelect
            :items="apartmentOptions"
            placeholder="Квартира"
            v-model="selectedApartment"
            style="grid-column: 5 / 9; grid-row: 1;"
            labelKey="label"
          />
          <CustomInput
            placeholder="Срок"
            v-model="due_date"
            type="datetime-local"
            style="grid-column: 9 / 13; grid-row: 1;"
          />


          <CustomInput
            placeholder="Фамилия"
            v-model="lastname"
            
            style="grid-column: 1 / 4; grid-row: 2;"
          />
          <CustomInput
            placeholder="Имя"
            v-model="first_name"
            style="grid-column: 4 / 7; grid-row: 2;"
          />
          <CustomInput
            placeholder="Отчество"
            v-model="patronymic_name"
            style="grid-column: 7 / 10; grid-row: 2;"
          />
          <CustomInput
            placeholder="Телефон"
            v-model="phone"
            style="grid-column: 10 / 13; grid-row: 2;"
          />


          <CustomInput
            placeholder="Описание заявки"
            v-model="description"
            type="textarea"
            style="grid-column: 1 / 13; grid-row: 3;"
          />
        </body>

        <div class="button-error-container">
          <button @click="saveData">
            {{ selectedAppeal ? "Сохранить" : "Создать" }}
          </button>
          <div v-if="error" class="error-container">
            <label class="error"> {{ error }} </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import CustomInput from "@/components/CustomInput.vue";
import CustomSelect from "@/components/CustomSelect.vue";

export default {
  data() {
    return {
      first_name: "",
      lastname: "",
      patronymic_name: "",
      due_date: "",
      phone: "",
      description: "",
      selectedPremise: null,
      selectedApartment: null,
      apartmentOptions: [],

      error: "",
    };
  },
  props: {
    title: {
      type: String,
      default: "Модальное окно",
    },
    confirmText: {
      type: String,
      default: "Ок",
    },
    selectedAppeal: {
      type: Object,
      default: null,
    },
  },
  components: { CustomInput, CustomSelect },
  computed: {
    userPremises() {
      return this.$store.getters.userPremises || [];
    },
    premiseAddresses() {
      return this.userPremises.map((premise) => ({
        id: premise.id,
        address: premise.address,
      }));
    },
  },
  watch: {
    selectedAppeal: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.first_name = newVal.applicant?.first_name || "";
          this.lastname = newVal.applicant?.last_name || "";
          this.patronymic_name = newVal.applicant?.patronymic_name || "";
          this.due_date = this.toDatetimeLocal(newVal?.due_date) || "";
          this.phone = newVal.applicant?.username || "";
          this.description = newVal?.description || "";
          this.selectedPremise = this.premiseAddresses.find(
            (premise) => premise.id === newVal.premise?.id
          ) || null;

          // загружаем квартиры только если выбрано здание
          if (this.selectedPremise) {
            this.fetchApartments().then(() => {
              this.selectedApartment = this.apartmentOptions.find(
                (apartment) => apartment.id === newVal.apartment?.id
              ) || null;
            });
          }
        } else {
          this.resetFields();
        }
      },
    },
    selectedPremise(newPremise) {
      if (newPremise) {
        this.fetchApartments();
      } else {
        this.apartmentOptions = [];
        this.selectedApartment = null;
      }
    },
  },
  methods: {
    confirmAction() {
      this.$emit("confirm");
    },
    closeModal() {
      this.$emit("close");
    },
    // Сбрасываем данные
    resetFields() {
      this.first_name = "";
      this.lastname = "";
      this.patronymic_name = "";
      this.due_date = "";
      this.phone = "";
      this.description = "";
      this.selectedPremise = null;
      this.selectedApartment = null;
      this.apartmentOptions = [];
    },
    // Обработка даты для заголовка
    formatDate(date) {
      if (!date) return "";
      
      const d = new Date(date);

      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();

      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");

      return `${day}.${month}.${year} ${hours}:${minutes}`;
    },
    // Обработка даты вывода в input
    toDatetimeLocal(dateString) {
      if (!dateString) return "";

      try {
        const date = new Date(dateString);

        // Проверяем валидность даты
        if (isNaN(date.getTime())) {
          this.error = `Некорректная дата: ${dateString}`;
          return "";
        }

        // Форматируем дату в строку формата YYYY-MM-DDTHH:mm
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
      } catch (error) {
        this.error = `Ошибка преобразования даты`;
        return "";
      }
    },
    // Обработка даты для API запроса
    formatDueDate(dateString) {
      if (!dateString) return "";

      try {
        const localDate = new Date(dateString);
        if (isNaN(localDate.getTime())) {
          this.error = `Некорректная дата: ${dateString}`;
          return "";
        }

        const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
        const formattedDate = utcDate.toISOString().replace(".000", "");
        return formattedDate;

      } catch (error) {
        this.error = `Ошибка форматирования даты`;
        return "";
      }
    },
    // Получаем квартиры
    async fetchApartments() {
      if (!this.selectedPremise) return;

      try {
        const response = await axios.get(
          `https://dev.moydomonline.ru/api/geo/v1.0/apartments/?premise_id=${this.selectedPremise.id}`
        );
        this.apartmentOptions = response.data.results.map((apartment) => ({
          id: apartment.id,
          label: apartment.label || `Квартира ${apartment.id}`,
        }));
      } catch (error) {
        this.error = `Ошибка при загрузке квартир`;
        this.apartmentOptions = [];
      }
    },
    // Проверка перед сохранением
    saveData() {
      if (this.selectedPremise == null ) {
        this.error = "Выберите дом";
      } else if (this.selectedApartment == null ) {
        this.error = "Выберите квартиру";
      } else if (this.due_date == "" ) {
        this.error = "Выберите сроки";
      } else if (this.lastname == "" ) {
        this.error = "Введите фамилию";
      } else if (this.first_name == "" ) {
        this.error = "Введите имя";
      } else if (this.phone == "" ) {
        this.error = "Введите телефон";
      } else {
        this.error = "";
        const formData = {
          premise_id: this.selectedPremise ? this.selectedPremise.id : null,  // Получаем id здания
          apartment_id: this.selectedApartment ? this.selectedApartment.id : null,  // Получаем id квартиры
          applicant: {
            first_name: this.first_name,
            last_name: this.lastname,
            patronymic_name: this.patronymic_name,
            username: this.phone.replace('+', ''),  // Используем phone как номер телефона
          },
          description: this.description,
          due_date: this.formatDueDate(this.due_date),  // Преобразуем срок в нужный формат
        };

        if (!this.selectedAppeal) {
          formData.status_id = 1;
        }

        if (this.selectedAppeal) {
          this.updateAppeal(formData);
        } else {
          this.createAppeal(formData);
        }
      }
    },
    // Редактирование данных
    async updateAppeal(formData) {
      if (!this.selectedAppeal) return;

      try {
        const response = await axios.patch(
          `https://dev.moydomonline.ru/api/appeals/v1.0/appeals/${this.selectedAppeal.id}/`,
          formData
        );
        if (response.status == 200) {
          this.$emit("data-saved");
          this.$emit('close');
        }
      } catch (error) {
        this.error = `Ошибка обновления заявки`;
        alert('Ошибка при обновлении заявки. Пожалуйста, попробуйте еще раз.');
      }
    },
    // Создание новой записи
    async createAppeal(formData) {
      try {
        const response = await axios.post(
          'https://dev.moydomonline.ru/api/appeals/v1.0/appeals/',
          formData,
          { headers: { 'Content-Type': 'application/json' } }
        );
        if (response.status == 200) {
          this.$emit("data-saved");
          this.$emit('close');
        }
      } catch (error) {
        this.error = `Ошибка создания заявки`;
        alert('Ошибка при создании заявки. Пожалуйста, попробуйте еще раз.');
      }
    },
  }
};
</script>


<style scoped lang="scss">
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
  padding: 20px;
  max-width: 90%;

  width: 738px;
  height: 480px;
}

.modal-container {
  display: flex;
  padding: 24px 32px;
  flex-direction: column;
  gap: 24px;
  background-color: $primary-color;
  border-radius: 8px;

  header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;

    h2 {
      font-weight: bold;
    }
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto auto auto;

  column-gap: 16px;
  row-gap: 32px;
}

button {
  padding: 8px 16px;
}

</style>
