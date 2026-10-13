/*
  إعدادات مهمة:
  1) غيّر رقم واتساب في WHATSAPP_NUMBER إلى رقمك الدولي بدون + أو مسافات.
  2) عدّل أسماء الخدمات وأسعارها في SERVICES.
  الأسعار أمثلة توضيحية، وليست أسعاراً مؤكدة.
*/
const WHATSAPP_NUMBER = "84562812172"; // مثال: رمز الدولة ثم الرقم، بدون + أو مسافات

const SERVICES = [
  {id:"web", icon:"⌘", name:"تصميم صفحة ويب", price:"يحدد حسب الطلب", description:"صفحة تعريفية متجاوبة تعرض نشاطك وخدماتك."},
  {id:"store", icon:"▣", name:"متجر إلكتروني", price:"يحدد حسب الطلب", description:"واجهة لعرض المنتجات والخدمات واستقبال الطلبات."},
  {id:"app", icon:"▱", name:"تصميم واجهات تطبيق", price:"يحدد حسب الطلب", description:"تصميم واجهات مرتبة وسهلة الاستخدام."},
  {id:"code", icon:"{ }", name:"برمجة مخصصة", price:"بعد مراجعة التفاصيل", description:"تنفيذ فكرة أو أداة برمجية حسب احتياجك."},
  {id:"support", icon:"⚙", name:"خدمات تقنية", price:"حسب الخدمة", description:"مساعدة تقنية وإعدادات رقمية حسب الطلب."},
  {id:"other", icon:"✦", name:"خدمة أخرى", price:"اتصل للاستفسار", description:"أرسل تفاصيل فكرتك لنناقش الحل المناسب."}
];

const $ = (selector) => document.querySelector(selector);
const serviceGrid = $("#serviceGrid");
const serviceSelect = $("#serviceSelect");
const orderForm = $("#orderForm");
const toast = $("#toast");
const STORAGE_KEY = "hanySoftLocalOrders_v1";
const statuses = ["جديد","قيد التنفيذ","مكتمل","ملغي"];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[char]));
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
}
function whatsappUrl(message) {
  const number = WHATSAPP_NUMBER.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
function openWhatsApp(message) {
  const number = WHATSAPP_NUMBER.replace(/\D/g, "");
  if (!number || number.length < 8) {
    showToast("عدّل رقم واتساب في ملف script.js إلى رقمك الصحيح أولاً.");
    return;
  }
  window.open(whatsappUrl(message), "_blank", "noopener");
}
function renderServices() {
  serviceGrid.innerHTML = SERVICES.map(service => `
    <article class="service-card">
      <div class="service-icon" aria-hidden="true">${escapeHtml(service.icon)}</div>
      <h3>${escapeHtml(service.name)}</h3>
      <p>${escapeHtml(service.description)}</p>
      <div class="service-bottom"><span class="price">${escapeHtml(service.price)}</span>
      <button class="order-service" data-service="${escapeHtml(service.id)}">اطلب الخدمة</button></div>
    </article>`).join("");
  serviceSelect.innerHTML = '<option value="">اختر الخدمة</option>' + SERVICES.map(service =>
    `<option value="${escapeHtml(service.id)}">${escapeHtml(service.name)}</option>`).join("");
}
function getOrders() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function saveOrders(orders) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(orders)); return true; }
  catch { showToast("تعذر الحفظ في هذا المتصفح."); return false; }
}
function renderOrders() {
  const orders = getOrders();
  $("#orderCount").textContent = `${orders.length} طلب محلي`;
  const tbody = $("#ordersTable");
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty">لا توجد طلبات محلية بعد.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>${escapeHtml(order.date)}</td><td>${escapeHtml(order.name)}</td>
      <td>${escapeHtml(order.phone)}</td><td>${escapeHtml(order.serviceName)}</td>
      <td>${escapeHtml(order.details)}</td>
      <td><select class="status-select" data-status-id="${escapeHtml(order.id)}" aria-label="حالة الطلب">
        ${statuses.map(status => `<option ${order.status === status ? "selected" : ""}>${status}</option>`).join("")}
      </select></td>
      <td><button class="order-service" data-delete-id="${escapeHtml(order.id)}">حذف</button></td>
    </tr>`).join("");
}
function csvEscape(value) { return '"' + String(value ?? "").replace(/"/g, '""') + '"'; }

renderServices();
renderOrders();
$("#year").textContent = new Date().getFullYear();
$("#footerWhatsApp").href = whatsappUrl("مرحباً هاني سوفت، أريد الاستفسار عن خدماتكم.");
$("#floatingWhatsApp").href = whatsappUrl("مرحباً هاني سوفت، أريد الاستفسار عن خدماتكم.");

$("#menuToggle").addEventListener("click", () => $("#mainNav").classList.toggle("open"));
$("#mainNav").addEventListener("click", event => {
  if (event.target.closest("a")) $("#mainNav").classList.remove("open");
});
serviceGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-service]");
  if (!button) return;
  serviceSelect.value = button.dataset.service;
  $("#order").scrollIntoView({behavior:"smooth"});
});
orderForm.addEventListener("submit", event => {
  event.preventDefault();
  const formData = new FormData(orderForm);
  const service = SERVICES.find(item => item.id === formData.get("service"));
  if (!service) { showToast("اختر الخدمة المطلوبة."); return; }
  const order = {
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
    date: new Date().toLocaleString("ar"),
    name: String(formData.get("customerName") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    serviceName: service.name,
    budget: String(formData.get("budget") || "").trim(),
    details: String(formData.get("details") || "").trim(),
    status: "جديد"
  };
  if (!order.name || !order.phone || !order.details) { showToast("يرجى إكمال الحقول المطلوبة."); return; }
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
  renderOrders();
  const message = [
    "طلب خدمة جديد - هاني سوفت",
    `اسم العميل: ${order.name}`,
    `رقم الهاتف: ${order.phone}`,
    `الخدمة: ${order.serviceName}`,
    `الميزانية: ${order.budget || "لم يحدد"}`,
    `التفاصيل: ${order.details}`
  ].join("\n");
  openWhatsApp(message);
});
$("#ordersTable").addEventListener("change", event => {
  const id = event.target.dataset.statusId;
  if (!id) return;
  const orders = getOrders();
  const order = orders.find(item => item.id === id);
  if (order && statuses.includes(event.target.value)) {
    order.status = event.target.value;
    saveOrders(orders);
    renderOrders();
    showToast("تم تحديث الحالة محلياً.");
  }
});
$("#ordersTable").addEventListener("click", event => {
  const id = event.target.dataset.deleteId;
  if (!id) return;
  if (!window.confirm("هل تريد حذف هذا الطلب من هذا المتصفح؟")) return;
  saveOrders(getOrders().filter(order => order.id !== id));
  renderOrders();
});
$("#exportOrders").addEventListener("click", () => {
  const orders = getOrders();
  if (!orders.length) { showToast("لا توجد طلبات لتصديرها."); return; }
  const rows = [["التاريخ","العميل","الهاتف","الخدمة","الميزانية","التفاصيل","الحالة"],
    ...orders.map(o => [o.date,o.name,o.phone,o.serviceName,o.budget,o.details,o.status])];
  const csv = "\uFEFF" + rows.map(row => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = "hany-soft-orders.csv"; link.click();
  URL.revokeObjectURL(url);
});
$("#clearOrders").addEventListener("click", () => {
  if (!window.confirm("سيتم حذف كل الطلبات المحفوظة محلياً على هذا المتصفح. متابعة؟")) return;
  saveOrders([]);
  renderOrders();
  showToast("تم حذف الطلبات المحلية.");
});
