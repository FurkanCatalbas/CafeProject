import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { usersService, UserDto } from '../../services/usersService';

interface UsersState {
  users: UserDto[];
  currentUser: UserDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_: void, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const users = await usersService.getAll();
      return users;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Kullanıcılar alınamadı');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: UserDto, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const user = await usersService.create(userData);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Kullanıcı oluşturulamadı');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (userData: UserDto, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const user = await usersService.update(userData);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Kullanıcı güncellenemedi');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state: UsersState) => {
      state.error = null;
    },
    setCurrentUser: (state: UsersState, action: PayloadAction<UserDto | null>) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder: any) => {
    builder
      .addCase(fetchUsers.pending, (state: UsersState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state: UsersState, action: any) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state: UsersState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createUser.pending, (state: UsersState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state: UsersState, action: any) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state: UsersState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUser.pending, (state: UsersState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state: UsersState, action: any) => {
        state.loading = false;
        const index = state.users.findIndex((user: UserDto) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state: UsersState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;
