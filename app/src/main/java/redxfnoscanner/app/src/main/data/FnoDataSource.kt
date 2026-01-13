package com.example.redxfnoscanner.data

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query

interface FnoApiService {
    @GET("v1/fno-data")
    suspend fun getFnoData(@Query("symbol") symbol: String): FnoData
}

object RetrofitClient {
    private const val BASE_URL = "https://api.example.com/"

    val instance: FnoApiService by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        retrofit.create(FnoApiService::class.java)
    }
}
