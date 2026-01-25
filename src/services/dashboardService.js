// Servicio para endpoints del DashboardController
import axios from 'axios'
import Global from '@/Global'

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getKpi(params = {}) {
  const { data } = await axios.get(`${Global.url}Dashboard/mesa/kpi`, { params, headers: authHeaders() })
  return data
}

// La mesa ahora expone tabla y export bajo /mesa
export async function getTablaDenuncias(params = {}) {
  const { data } = await axios.get(`${Global.url}Dashboard/mesa/tabla`, { params, headers: authHeaders() })
  return data
}
export async function exportDenuncias(params = {}) {
  return axios.get(`${Global.url}Dashboard/mesa/export`, {
    params,
    headers: authHeaders(),
    responseType: 'blob' // clave: recibir binario
  })
}

// Opciones para filtros (valores únicos)
export async function getMesaOpciones(params = {}) {
  const { data } = await axios.get(`${Global.url}Dashboard/mesa/opciones`, { params, headers: authHeaders() })
  return data
}