import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { placesService, PlaceDto } from '../../services/placesService';

interface PlacesState {
  places: PlaceDto[];
  currentPlace: PlaceDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: PlacesState = {
  places: [],
  currentPlace: null,
  loading: false,
  error: null,
};

export const fetchPlaces = createAsyncThunk(
  'places/fetchPlaces',
  async (_: void, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const places = await placesService.getAll();
      return places;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Masalar alınamadı');
    }
  }
);

export const createPlace = createAsyncThunk(
  'places/createPlace',
  async (placeData: PlaceDto, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const place = await placesService.create(placeData);
      return place;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Masa oluşturulamadı');
    }
  }
);

export const updatePlace = createAsyncThunk(
  'places/updatePlace',
  async (placeData: PlaceDto, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const place = await placesService.update(placeData);
      return place;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Masa güncellenemedi');
    }
  }
);

const placesSlice = createSlice({
  name: 'places',
  initialState,
  reducers: {
    clearError: (state: PlacesState) => {
      state.error = null;
    },
    setCurrentPlace: (state: PlacesState, action: PayloadAction<PlaceDto | null>) => {
      state.currentPlace = action.payload;
    },
  },
  extraReducers: (builder: any) => {
    builder
      .addCase(fetchPlaces.pending, (state: PlacesState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaces.fulfilled, (state: PlacesState, action: any) => {
        state.loading = false;
        state.places = action.payload;
      })
      .addCase(fetchPlaces.rejected, (state: PlacesState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPlace.pending, (state: PlacesState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlace.fulfilled, (state: PlacesState, action: any) => {
        state.loading = false;
        state.places.push(action.payload);
      })
      .addCase(createPlace.rejected, (state: PlacesState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePlace.pending, (state: PlacesState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlace.fulfilled, (state: PlacesState, action: any) => {
        state.loading = false;
        const index = state.places.findIndex((place: PlaceDto) => place.id === action.payload.id);
        if (index !== -1) {
          state.places[index] = action.payload;
        }
      })
      .addCase(updatePlace.rejected, (state: PlacesState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPlace } = placesSlice.actions;
export default placesSlice.reducer;
