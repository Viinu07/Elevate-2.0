import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { userService, type User } from '@/api/userService';

export interface UserProfile extends User { }

interface UserState {
    data: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: UserState = {
    data: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

export const fetchCurrentUser = createAsyncThunk(
    'user/fetchCurrent',
    async () => {
        const user = await userService.getCurrentUser();
        return user;
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            state.data = null;
            state.isAuthenticated = false;
        },
        setUser: (state, action: PayloadAction<UserProfile>) => {
            state.data = action.payload;
            state.isAuthenticated = true;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<UserProfile | null>) => {
                state.isLoading = false;
                if (action.payload) {
                    state.data = action.payload;
                    state.isAuthenticated = true;
                }
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch user';
            });
    },
});

export const { logout, setUser } = userSlice.actions;
export default userSlice.reducer;
