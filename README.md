# Gemini Chatbot Projesi

Bu proje, Gemini API'sini kullanarak bir chatbot sitesi oluşturmayı amaçlamaktadır. Kullanıcılar, site üzerinden doğal dil işleme yetenekleri ile etkileşimde bulunabilirler.

## ✨ Temel Özellikler

1. 🌑 Karanlık Mod Desteği: Uygulama, kullanıcıların arayüzü karanlık veya aydınlık olarak değiştirmesine olanak tanır.
2. 🛠 Ayarlar Menüsü: Kullanıcılara ek seçenekler sunan yeni bir ayarlar butonu eklendi.
3. 🌡 Sıcaklık Ayarı: Kullanıcılar, AI modelinin "sıcaklığını" ayarlayarak yanıtların çeşitliliğini ve yaratıcılığını etkileyebilir.
4. 🔄 Gemini 1.5 Seçenekleri: Kullanıcılar, Gemini 1.5 Pro veya 1.5 Flash modelleri arasında seçim yapabilir.
5. 🔊 Metni Okuyan Ses Butonu: Kullanıcılar, metni sesli olarak dinleyebilmek için bir ses butonu kullanabilir.
6. 🔧 Geliştirilmiş Hata Yönetimi: API anahtarı eksikse veya başka bir hata oluşursa, kullanıcıya anlamlı hata mesajları gösterilir.
7. ⏳ Yükleme Göstergesi: Yanıt beklenirken bir yükleme animasyonu gösterilir.
8. 🔑 Çevresel Değişken Kullanımı: API anahtarı artık güvenli bir şekilde çevresel değişkenlerden alınır.
9. 🎨 Kaydırma Çubuğu Stilleri: Sohbet konteynerinin kaydırma çubuğu, hem aydınlık hem de karanlık modda daha iyi görünecek şekilde stillendirildi.

## Ana Bileşenler

- **TypeScript**: Tip güvenliği sağlayan ve daha güçlü bir geliştirme deneyimi sunan JavaScript'in genişletilmiş bir versiyonudur.
- **React**: Kullanıcı arayüzü oluşturmak için kullanılan bir JavaScript kütüphanesidir.
- **Vite**: Hızlı bir geliştirme ortamı ve build aracı sağlayan modern bir web geliştirme aracıdır.
- **Tailwind CSS**: Hızlı UI geliştirme için kullanılan bir utility-first CSS framework'üdür.
- **Lucide React**: İkonlar için kullanılan bir React kütüphanesidir.
- **Google Generative AI**: Gemini API'sini kullanmak için Google tarafından sağlanan bir kütüphanedir.

## Kurulum

Aşağıdaki adımları izleyerek projeyi yerel makinenizde kurabilirsiniz:

### 1. Repo'yu Klonlayın

```bash
git clone https://github.com/Imparatorgit/imparatorgeminichatbotwebsite/
```
### 2. Proje Klasörüne geçin

```bash
cd imparatorgeminichatbotwebsite
```

### 3. Gerekli Bağımlılıkları yükleyin

```bash
npm install
```

### 4. API keyini ekleyin

```bash
.env dosyasında dosyayı şu şekilde düzenleyin
VITE_GEMINI_API_KEY='seninapikeyin"
```


### 4. Ardından Sitenizi çalıştırın

```bash
npm run dev
```
