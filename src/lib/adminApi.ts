// frontend/lib/adminApi.ts
const BASE = import.meta.env.VITE_API_URL;
const j = (res: Response) => res.json();

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// CATEGORIES
export const listCategories = () => fetch(`${BASE}/categories`).then(j);
export const createCategory = (body: any) =>
  fetch(`${BASE}/categories/addCategory`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body),
  }).then(j);
export const updateCategory = (id: string, body: any) =>
  fetch(`${BASE}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body),
  }).then(j);
export const deleteCategory = (id: string) =>
  fetch(`${BASE}/categories/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  }).then(j);

// PRODUCTS
export const listProducts = () => fetch(`${BASE}/products`).then(j);
export const createProduct = (body: any) =>
  fetch(`${BASE}/products/addNewProduct`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body),
  }).then(j);
export const updateProduct = (id: string, body: any) =>
  fetch(`${BASE}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body),
  }).then(j);
export const deleteProduct = (id: string) =>
  fetch(`${BASE}/products/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  }).then(j);
export const getProduct = (id: string) =>
  fetch(`${BASE}/products/${id}`).then((r) => r.json());

// OPTION IMAGE DELETE (persisted option)
export const deleteOptionImageApi = (productId: string, optId: string) =>
  fetch(`${BASE}/products/${productId}/option-image/${optId}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  }).then(j);

// CLOUDINARY destroy by public_id (unsaved option)
export const destroyByPublicIdApi = (publicId: string) =>
  fetch(`${BASE}/cloudinary/destroy`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ publicId }),
  }).then(j);

// USERS
export const createUser = (body: any) =>
  fetch(`${BASE}/users/newUser`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body),
  }).then(j);
export const listUsers = () =>
  fetch(`${BASE}/users`, { headers: authHeader() }).then(j);
export const updateUser = (id: string, body: any) =>
  fetch(`${BASE}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body),
  }).then(j);
export const deleteUser = (id: string) =>
  fetch(`${BASE}/users/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  }).then(j);

// ORDERS
export const listOrders = () =>
  fetch(`${BASE}/orders`, { headers: { ...authHeader() } }).then(j);
export const getOrder = (id: string) =>
  fetch(`${BASE}/orders/${id}`, { headers: { ...authHeader() } }).then(j);
export const updateOrderStatus = (id: string, status: string) =>
  fetch(`${BASE}/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ status }),
  }).then(j);
