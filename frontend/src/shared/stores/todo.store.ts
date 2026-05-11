import { defineStore } from 'pinia';
import type { Todo, TodoForm, TodoUpdateForm } from '../interfaces';
import { createTodo, deleteTodo, fetchAllTodo, fetchSearchTodo, updateTodo } from '../services';
import type { ResponseData } from '../helpers';

interface ResponseTodoData {
  id?: string;
  _id?: string;
  date: string;
  text: string;
  completed: boolean;
  message?: string;
}

interface TodoState {
  allTodo: Todo[] | null;
  loading: boolean | false;
}

export const useTodo = defineStore('todo', {
  state: (): TodoState => ({
    allTodo: null,
    loading: false
  }),
  actions: {
    async createTodo(todoForm: TodoForm) {
      this.loading = true;
      await createTodo(todoForm).then((response: ResponseData) => {
        const todoResponse = response as unknown as ResponseTodoData;
        const id = todoResponse.id || todoResponse._id || '';
        // normalize response to Todo (convert date string to Date)
        const todo: Todo = {
          id: id,
          date: new Date(todoResponse.date),
          text: todoResponse.text,
          completed: todoResponse.completed
        };
        // ajoute le todo dans le tableau
        if (this.allTodo) {
          this.allTodo.push(todo);
          this.allTodo = this.allTodo.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        }
        this.loading = false;
      });
    },
    async updateTodo(id: string, todoForm: TodoUpdateForm) {
      await updateTodo(id, todoForm).then((response: ResponseData) => {
        const todoResponse = response as unknown as ResponseTodoData;
        const respId = todoResponse.id || todoResponse._id || '';
        if (this.allTodo) {
          // mets à jour le todo dans le tableau
          this.allTodo = this.allTodo.map((todo) =>
            todo.id === respId
              ? {
                  ...todo,
                  id: respId,
                  date: new Date(todoResponse.date),
                  text: todoResponse.text,
                  completed: todoResponse.completed
                }
              : todo
          );
        }
      });
    },
    async deleteTodo(id: string) {
      await deleteTodo(id).then((response: ResponseData) => {
        const todoResponse = response as unknown as ResponseTodoData;
        const respId = todoResponse.id || todoResponse._id || '';
        if (this.allTodo) {
          // supprime le todo du tableau
          this.allTodo = this.allTodo.filter((todo) => todo.id !== respId);
        }
      });
    },
    async fetchAllTodo() {
      this.loading = true;
      const response = await fetchAllTodo();
      if (response) {
        this.allTodo = response.map((todo: any) => ({
          ...todo,
          id: todo.id || todo._id || '',
          date: new Date(todo.date)
        }));
      } else {
        this.allTodo = null;
      }
      this.loading = false;
    },
    async fetchSearchTodo(query: string) {
      this.loading = true;
      const response = await fetchSearchTodo(query);
      if (response) {
        this.allTodo = response.map((todo: any) => ({
          ...todo,
          id: todo.id || todo._id || '',
          date: new Date(todo.date)
        }));
      } else {
        this.allTodo = [];
      }
      this.loading = false;
    }
  }
});
