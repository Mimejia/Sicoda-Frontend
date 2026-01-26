<template>
  <div class="pdf-visualizer-container">
    <div v-if="loading" class="text-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2 text-muted fw-bold">Procesando documento PDF, por favor espere...</p>
    </div>

    <div v-else-if="pdfBlobUrl" class="pdf-wrapper">
      <iframe
        :src="pdfBlobUrl"
        class="pdf-iframe"
        title="Documento PDF"
      ></iframe>
    </div>

    <div v-else class="text-center p-4">
      <p class="text-muted">No se pudo cargar el documento.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PdfVisualizer',
  props: {
    // Recibe el string base64 del PDF
    base64: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      pdfBlobUrl: null
    };
  },
  watch: {
    base64: {
      immediate: true,
      handler(val) {
        this.procesarPdf(val);
      }
    }
  },
  beforeUnmount() {
    this.limpiarUrl();
  },
  methods: {
    limpiarUrl() {
      if (this.pdfBlobUrl) {
        URL.revokeObjectURL(this.pdfBlobUrl);
        this.pdfBlobUrl = null;
      }
    },
    async procesarPdf(base64Data) {
      if (!base64Data) {
        this.limpiarUrl();
        return;
      }

      this.loading = true;
      // Damos un pequeño respiro al UI antes de bloquear con la conversión
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        // Limpiamos URL anterior si existe
        this.limpiarUrl();

        // 1. Decodificar Base64
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        
        // Loop intensivo
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // 2. Crear Blob
        const blob = new Blob([bytes], { type: 'application/pdf' });
        
        // 3. Crear URL
        this.pdfBlobUrl = URL.createObjectURL(blob);
      } catch (error) {
        console.error('Error generando PDF Blob:', error);
        this.pdfBlobUrl = null;
      } finally {
        this.loading = false;
        this.$emit('terminado'); // Avisar al padre por si quiere desbloquear algo más
      }
    }
  }
};
</script>

<style scoped>
.pdf-visualizer-container {
  width: 100%;
  height: 100%;
  min-height: 400px; /* Altura mínima para que se vea bien */
  display: flex;
  flex-direction: column;
}

.pdf-wrapper {
  flex: 1;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>
