export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      barrios: {
        Row: {
          creado_en: string
          id: number
          id_comuna: number
          nombre: string
        }
        Insert: {
          creado_en?: string
          id?: never
          id_comuna: number
          nombre: string
        }
        Update: {
          creado_en?: string
          id?: never
          id_comuna?: number
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "barrios_id_comuna_fkey"
            columns: ["id_comuna"]
            isOneToOne: false
            referencedRelation: "comunas"
            referencedColumns: ["id"]
          },
        ]
      }
      campana_territorio: {
        Row: {
          id_campana: number
          id_departamento: string | null
          id_municipio: string | null
        }
        Insert: {
          id_campana: number
          id_departamento?: string | null
          id_municipio?: string | null
        }
        Update: {
          id_campana?: number
          id_departamento?: string | null
          id_municipio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campana_territorio_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campana_territorio_id_departamento_fkey"
            columns: ["id_departamento"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campana_territorio_id_municipio_fkey"
            columns: ["id_municipio"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
        ]
      }
      campanas: {
        Row: {
          actualizado_en: string
          creado_en: string
          estado: Database["public"]["Enums"]["estado_campana"]
          finalizado_en: string | null
          id: number
          id_cliente: number
          id_proceso_electoral: number
          iniciado_en: string | null
          nombre: string
          purgado_en: string | null
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          estado?: Database["public"]["Enums"]["estado_campana"]
          finalizado_en?: string | null
          id?: never
          id_cliente: number
          id_proceso_electoral: number
          iniciado_en?: string | null
          nombre: string
          purgado_en?: string | null
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          estado?: Database["public"]["Enums"]["estado_campana"]
          finalizado_en?: string | null
          id?: never
          id_cliente?: number
          id_proceso_electoral?: number
          iniciado_en?: string | null
          nombre?: string
          purgado_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campanas_id_cliente_fkey"
            columns: ["id_cliente"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campanas_id_proceso_electoral_fkey"
            columns: ["id_proceso_electoral"]
            isOneToOne: false
            referencedRelation: "procesos_electorales"
            referencedColumns: ["id"]
          },
        ]
      }
      caracteristicas_campana: {
        Row: {
          actualizado_en: string
          auditoria_e14: boolean
          captura_web: boolean
          id_campana: number
          resolutor_captcha: boolean
          telegram: boolean
          whatsapp: boolean
        }
        Insert: {
          actualizado_en?: string
          auditoria_e14?: boolean
          captura_web?: boolean
          id_campana: number
          resolutor_captcha?: boolean
          telegram?: boolean
          whatsapp?: boolean
        }
        Update: {
          actualizado_en?: string
          auditoria_e14?: boolean
          captura_web?: boolean
          id_campana?: number
          resolutor_captcha?: boolean
          telegram?: boolean
          whatsapp?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "caracteristicas_campana_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: true
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          actualizado_en: string
          correo_contacto: string | null
          creado_en: string
          documento: string | null
          id: number
          id_usuario: string | null
          nombre: string
          notas: string | null
          telefono: string | null
        }
        Insert: {
          actualizado_en?: string
          correo_contacto?: string | null
          creado_en?: string
          documento?: string | null
          id?: number
          id_usuario?: string | null
          nombre: string
          notas?: string | null
          telefono?: string | null
        }
        Update: {
          actualizado_en?: string
          correo_contacto?: string | null
          creado_en?: string
          documento?: string | null
          id?: number
          id_usuario?: string | null
          nombre?: string
          notas?: string | null
          telefono?: string | null
        }
        Relationships: []
      }
      comunas: {
        Row: {
          creado_en: string
          id: number
          id_municipio: string | null
          nombre: string
        }
        Insert: {
          creado_en?: string
          id?: never
          id_municipio?: string | null
          nombre: string
        }
        Update: {
          creado_en?: string
          id?: never
          id_municipio?: string | null
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunas_id_municipio_fkey"
            columns: ["id_municipio"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion_integracion_plataforma: {
        Row: {
          activa: boolean
          actualizado_en: string
          configuracion: Json
          creado_en: string
          proveedor: Database["public"]["Enums"]["proveedor_integracion"]
        }
        Insert: {
          activa?: boolean
          actualizado_en?: string
          configuracion?: Json
          creado_en?: string
          proveedor: Database["public"]["Enums"]["proveedor_integracion"]
        }
        Update: {
          activa?: boolean
          actualizado_en?: string
          configuracion?: Json
          creado_en?: string
          proveedor?: Database["public"]["Enums"]["proveedor_integracion"]
        }
        Relationships: []
      }
      configuracion_marca_plataforma: {
        Row: {
          actualizado_en: string
          color_acento: string | null
          color_etiqueta: string | null
          color_fondo_pagina: string | null
          color_fondo_sidebar: string | null
          color_primario: string | null
          color_secundario: string | null
          color_subtitulo: string | null
          color_texto: string | null
          color_titulo: string | null
          etiqueta_panel: string | null
          familia_fuente: string | null
          fuente_cuerpo: string | null
          fuente_subtitulos: string | null
          fuente_titulos: string | null
          id: number
          login_boton_fondo: string | null
          login_fondo_centro: string | null
          login_fondo_exterior: string | null
          login_panel_fondo: string | null
          nombre_plataforma: string | null
          peso_etiqueta: number | null
          peso_subtitulo: number | null
          peso_texto: number | null
          peso_titulo: number | null
          subtitulo_login: string | null
          texto_alt_logo: string | null
          texto_boton_login: string | null
          url_favicon: string | null
          url_logo: string | null
        }
        Insert: {
          actualizado_en?: string
          color_acento?: string | null
          color_etiqueta?: string | null
          color_fondo_pagina?: string | null
          color_fondo_sidebar?: string | null
          color_primario?: string | null
          color_secundario?: string | null
          color_subtitulo?: string | null
          color_texto?: string | null
          color_titulo?: string | null
          etiqueta_panel?: string | null
          familia_fuente?: string | null
          fuente_cuerpo?: string | null
          fuente_subtitulos?: string | null
          fuente_titulos?: string | null
          id?: number
          login_boton_fondo?: string | null
          login_fondo_centro?: string | null
          login_fondo_exterior?: string | null
          login_panel_fondo?: string | null
          nombre_plataforma?: string | null
          peso_etiqueta?: number | null
          peso_subtitulo?: number | null
          peso_texto?: number | null
          peso_titulo?: number | null
          subtitulo_login?: string | null
          texto_alt_logo?: string | null
          texto_boton_login?: string | null
          url_favicon?: string | null
          url_logo?: string | null
        }
        Update: {
          actualizado_en?: string
          color_acento?: string | null
          color_etiqueta?: string | null
          color_fondo_pagina?: string | null
          color_fondo_sidebar?: string | null
          color_primario?: string | null
          color_secundario?: string | null
          color_subtitulo?: string | null
          color_texto?: string | null
          color_titulo?: string | null
          etiqueta_panel?: string | null
          familia_fuente?: string | null
          fuente_cuerpo?: string | null
          fuente_subtitulos?: string | null
          fuente_titulos?: string | null
          id?: number
          login_boton_fondo?: string | null
          login_fondo_centro?: string | null
          login_fondo_exterior?: string | null
          login_panel_fondo?: string | null
          nombre_plataforma?: string | null
          peso_etiqueta?: number | null
          peso_subtitulo?: number | null
          peso_texto?: number | null
          peso_titulo?: number | null
          subtitulo_login?: string | null
          texto_alt_logo?: string | null
          texto_boton_login?: string | null
          url_favicon?: string | null
          url_logo?: string | null
        }
        Relationships: []
      }
      cuarentena_votantes: {
        Row: {
          actualizado_en: string
          apellidos: string
          canal_origen: Database["public"]["Enums"]["canal_captura"]
          creado_en: string
          creado_por: string | null
          direccion: string | null
          documento: string
          estado: Database["public"]["Enums"]["estado_cuarentena"]
          fecha_nacimiento: string | null
          id: number
          id_campana: number
          id_cuarentena_conflicto: number | null
          id_lider_directo: number | null
          id_lugar_trabajo: number | null
          id_puesto_votacion: number | null
          id_rol: number | null
          id_votante_conflicto: number | null
          mesa: string | null
          nombres: string
          notas_resolucion: string | null
          resuelto_en: string | null
          resuelto_por: string | null
          sexo: Database["public"]["Enums"]["tipo_sexo"] | null
          similitud_nombre: number | null
          telefono: string | null
          tipo_coincidencia: Database["public"]["Enums"]["tipo_coincidencia_cuarentena"]
          tipo_documento: Database["public"]["Enums"]["tipo_documento"]
        }
        Insert: {
          actualizado_en?: string
          apellidos: string
          canal_origen?: Database["public"]["Enums"]["canal_captura"]
          creado_en?: string
          creado_por?: string | null
          direccion?: string | null
          documento: string
          estado?: Database["public"]["Enums"]["estado_cuarentena"]
          fecha_nacimiento?: string | null
          id?: never
          id_campana: number
          id_cuarentena_conflicto?: number | null
          id_lider_directo?: number | null
          id_lugar_trabajo?: number | null
          id_puesto_votacion?: number | null
          id_rol?: number | null
          id_votante_conflicto?: number | null
          mesa?: string | null
          nombres: string
          notas_resolucion?: string | null
          resuelto_en?: string | null
          resuelto_por?: string | null
          sexo?: Database["public"]["Enums"]["tipo_sexo"] | null
          similitud_nombre?: number | null
          telefono?: string | null
          tipo_coincidencia: Database["public"]["Enums"]["tipo_coincidencia_cuarentena"]
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"]
        }
        Update: {
          actualizado_en?: string
          apellidos?: string
          canal_origen?: Database["public"]["Enums"]["canal_captura"]
          creado_en?: string
          creado_por?: string | null
          direccion?: string | null
          documento?: string
          estado?: Database["public"]["Enums"]["estado_cuarentena"]
          fecha_nacimiento?: string | null
          id?: never
          id_campana?: number
          id_cuarentena_conflicto?: number | null
          id_lider_directo?: number | null
          id_lugar_trabajo?: number | null
          id_puesto_votacion?: number | null
          id_rol?: number | null
          id_votante_conflicto?: number | null
          mesa?: string | null
          nombres?: string
          notas_resolucion?: string | null
          resuelto_en?: string | null
          resuelto_por?: string | null
          sexo?: Database["public"]["Enums"]["tipo_sexo"] | null
          similitud_nombre?: number | null
          telefono?: string | null
          tipo_coincidencia?: Database["public"]["Enums"]["tipo_coincidencia_cuarentena"]
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"]
        }
        Relationships: [
          {
            foreignKeyName: "cuarentena_votantes_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuarentena_votantes_id_cuarentena_conflicto_fkey"
            columns: ["id_cuarentena_conflicto"]
            isOneToOne: false
            referencedRelation: "cuarentena_votantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuarentena_votantes_id_lider_directo_fkey"
            columns: ["id_lider_directo"]
            isOneToOne: false
            referencedRelation: "votantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuarentena_votantes_id_lugar_trabajo_fkey"
            columns: ["id_lugar_trabajo"]
            isOneToOne: false
            referencedRelation: "lugares_trabajo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuarentena_votantes_id_puesto_votacion_fkey"
            columns: ["id_puesto_votacion"]
            isOneToOne: false
            referencedRelation: "puestos_votacion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuarentena_votantes_id_rol_fkey"
            columns: ["id_rol"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuarentena_votantes_id_votante_conflicto_fkey"
            columns: ["id_votante_conflicto"]
            isOneToOne: false
            referencedRelation: "votantes"
            referencedColumns: ["id"]
          },
        ]
      }
      datos_trabajador_votante: {
        Row: {
          actualizado_en: string
          creado_en: string
          direccion_trabajo: string | null
          id: number
          id_barrio: number | null
          id_comuna: number | null
          id_votante: number
          lugar_trabajo: string | null
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          direccion_trabajo?: string | null
          id?: never
          id_barrio?: number | null
          id_comuna?: number | null
          id_votante: number
          lugar_trabajo?: string | null
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          direccion_trabajo?: string | null
          id?: never
          id_barrio?: number | null
          id_comuna?: number | null
          id_votante?: number
          lugar_trabajo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "datos_trabajador_votante_id_barrio_fkey"
            columns: ["id_barrio"]
            isOneToOne: false
            referencedRelation: "barrios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "datos_trabajador_votante_id_comuna_fkey"
            columns: ["id_comuna"]
            isOneToOne: false
            referencedRelation: "comunas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "datos_trabajador_votante_id_votante_fkey"
            columns: ["id_votante"]
            isOneToOne: true
            referencedRelation: "votantes"
            referencedColumns: ["id"]
          },
        ]
      }
      departamentos: {
        Row: {
          creado_en: string
          id: string
          latitud: number | null
          longitud: number | null
          nombre: string
        }
        Insert: {
          creado_en?: string
          id: string
          latitud?: number | null
          longitud?: number | null
          nombre: string
        }
        Update: {
          creado_en?: string
          id?: string
          latitud?: number | null
          longitud?: number | null
          nombre?: string
        }
        Relationships: []
      }
      exportaciones_campana: {
        Row: {
          creado_en: string
          exportado_por: string | null
          id: number
          id_campana: number
          ruta_almacenamiento: string
          tamano_archivo: number | null
        }
        Insert: {
          creado_en?: string
          exportado_por?: string | null
          id?: never
          id_campana: number
          ruta_almacenamiento: string
          tamano_archivo?: number | null
        }
        Update: {
          creado_en?: string
          exportado_por?: string | null
          id?: never
          id_campana?: number
          ruta_almacenamiento?: string
          tamano_archivo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exportaciones_campana_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
        ]
      }
      integraciones_campana: {
        Row: {
          activa: boolean
          actualizado_en: string
          configuracion_cifrada: string
          creado_en: string
          id: number
          id_campana: number
          proveedor: Database["public"]["Enums"]["proveedor_integracion"]
        }
        Insert: {
          activa?: boolean
          actualizado_en?: string
          configuracion_cifrada?: string
          creado_en?: string
          id?: never
          id_campana: number
          proveedor: Database["public"]["Enums"]["proveedor_integracion"]
        }
        Update: {
          activa?: boolean
          actualizado_en?: string
          configuracion_cifrada?: string
          creado_en?: string
          id?: never
          id_campana?: number
          proveedor?: Database["public"]["Enums"]["proveedor_integracion"]
        }
        Relationships: [
          {
            foreignKeyName: "integraciones_campana_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
        ]
      }
      lugares_trabajo: {
        Row: {
          actualizado_en: string
          creado_en: string
          direccion: string | null
          id: number
          id_barrio: number | null
          id_campana: number
          id_comuna: number | null
          nombre: string
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          direccion?: string | null
          id?: never
          id_barrio?: number | null
          id_campana: number
          id_comuna?: number | null
          nombre: string
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          direccion?: string | null
          id?: never
          id_barrio?: number | null
          id_campana?: number
          id_comuna?: number | null
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "lugares_trabajo_id_barrio_fkey"
            columns: ["id_barrio"]
            isOneToOne: false
            referencedRelation: "barrios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lugares_trabajo_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lugares_trabajo_id_comuna_fkey"
            columns: ["id_comuna"]
            isOneToOne: false
            referencedRelation: "comunas"
            referencedColumns: ["id"]
          },
        ]
      }
      miembros_campana: {
        Row: {
          creado_en: string
          id: number
          id_campana: number
          id_usuario: string
          rol: Database["public"]["Enums"]["rol_miembro_campana"]
        }
        Insert: {
          creado_en?: string
          id?: never
          id_campana: number
          id_usuario: string
          rol?: Database["public"]["Enums"]["rol_miembro_campana"]
        }
        Update: {
          creado_en?: string
          id?: never
          id_campana?: number
          id_usuario?: string
          rol?: Database["public"]["Enums"]["rol_miembro_campana"]
        }
        Relationships: [
          {
            foreignKeyName: "miembros_campana_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
        ]
      }
      miembros_cliente: {
        Row: {
          creado_en: string
          id: number
          id_cliente: number | null
          id_usuario: string
        }
        Insert: {
          creado_en?: string
          id?: number
          id_cliente?: number | null
          id_usuario: string
        }
        Update: {
          creado_en?: string
          id?: number
          id_cliente?: number | null
          id_usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: "miembros_cliente_id_cliente_fkey"
            columns: ["id_cliente"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      miembros_plataforma: {
        Row: {
          creado_en: string
          id_usuario: string
          rol: Database["public"]["Enums"]["rol_plataforma"]
        }
        Insert: {
          creado_en?: string
          id_usuario: string
          rol?: Database["public"]["Enums"]["rol_plataforma"]
        }
        Update: {
          creado_en?: string
          id_usuario?: string
          rol?: Database["public"]["Enums"]["rol_plataforma"]
        }
        Relationships: []
      }
      municipios: {
        Row: {
          creado_en: string
          id: string
          id_departamento: string
          latitud: number | null
          longitud: number | null
          nombre: string
        }
        Insert: {
          creado_en?: string
          id: string
          id_departamento: string
          latitud?: number | null
          longitud?: number | null
          nombre: string
        }
        Update: {
          creado_en?: string
          id?: string
          id_departamento?: string
          latitud?: number | null
          longitud?: number | null
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "municipios_id_departamento_fkey"
            columns: ["id_departamento"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      novedades: {
        Row: {
          creado_en: string
          creado_por: string | null
          detalle: string | null
          id: number
          id_tipo_novedad: number
          id_votante: number
        }
        Insert: {
          creado_en?: string
          creado_por?: string | null
          detalle?: string | null
          id?: never
          id_tipo_novedad: number
          id_votante: number
        }
        Update: {
          creado_en?: string
          creado_por?: string | null
          detalle?: string | null
          id?: never
          id_tipo_novedad?: number
          id_votante?: number
        }
        Relationships: [
          {
            foreignKeyName: "novedades_id_tipo_novedad_fkey"
            columns: ["id_tipo_novedad"]
            isOneToOne: false
            referencedRelation: "tipos_novedad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "novedades_id_votante_fkey"
            columns: ["id_votante"]
            isOneToOne: false
            referencedRelation: "votantes"
            referencedColumns: ["id"]
          },
        ]
      }
      procesos_electorales: {
        Row: {
          creado_en: string
          fecha_eleccion: string | null
          id: number
          nombre: string
        }
        Insert: {
          creado_en?: string
          fecha_eleccion?: string | null
          id?: number
          nombre: string
        }
        Update: {
          creado_en?: string
          fecha_eleccion?: string | null
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      puestos_votacion: {
        Row: {
          actualizado_en: string
          actualizado_registraduria_en: string
          cantidad_mesas: number
          creado_en: string
          direccion: string | null
          embedding: string | null
          fuente: string
          id: number
          id_barrio: number | null
          id_comuna: number | null
          municipio: string | null
          nombre: string
          votantes_hombres_admite: number
          votantes_mujeres_admite: number
        }
        Insert: {
          actualizado_en?: string
          actualizado_registraduria_en?: string
          cantidad_mesas?: number
          creado_en?: string
          direccion?: string | null
          embedding?: string | null
          fuente?: string
          id?: never
          id_barrio?: number | null
          id_comuna?: number | null
          municipio?: string | null
          nombre: string
          votantes_hombres_admite?: number
          votantes_mujeres_admite?: number
        }
        Update: {
          actualizado_en?: string
          actualizado_registraduria_en?: string
          cantidad_mesas?: number
          creado_en?: string
          direccion?: string | null
          embedding?: string | null
          fuente?: string
          id?: never
          id_barrio?: number | null
          id_comuna?: number | null
          municipio?: string | null
          nombre?: string
          votantes_hombres_admite?: number
          votantes_mujeres_admite?: number
        }
        Relationships: [
          {
            foreignKeyName: "puestos_votacion_id_barrio_fkey"
            columns: ["id_barrio"]
            isOneToOne: false
            referencedRelation: "barrios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "puestos_votacion_id_comuna_fkey"
            columns: ["id_comuna"]
            isOneToOne: false
            referencedRelation: "comunas"
            referencedColumns: ["id"]
          },
        ]
      }
      recolectores_telegram: {
        Row: {
          creado_en: string
          id: number
          id_campana: number
          id_rol: number | null
          id_usuario: string | null
          telegram_user_id: number
          telegram_username: string | null
        }
        Insert: {
          creado_en?: string
          id?: never
          id_campana: number
          id_rol?: number | null
          id_usuario?: string | null
          telegram_user_id: number
          telegram_username?: string | null
        }
        Update: {
          creado_en?: string
          id?: never
          id_campana?: number
          id_rol?: number | null
          id_usuario?: string | null
          telegram_user_id?: number
          telegram_username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recolectores_telegram_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recolectores_telegram_id_rol_fkey"
            columns: ["id_rol"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      registro_auditoria: {
        Row: {
          accion: string
          creado_en: string
          id: number
          id_actor: string | null
          id_campana: number | null
          id_entidad: string | null
          metadatos: Json
          tipo_entidad: string
        }
        Insert: {
          accion: string
          creado_en?: string
          id?: never
          id_actor?: string | null
          id_campana?: number | null
          id_entidad?: string | null
          metadatos?: Json
          tipo_entidad: string
        }
        Update: {
          accion?: string
          creado_en?: string
          id?: never
          id_actor?: string | null
          id_campana?: number | null
          id_entidad?: string | null
          metadatos?: Json
          tipo_entidad?: string
        }
        Relationships: [
          {
            foreignKeyName: "registro_auditoria_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          creado_en: string
          id: number
          id_campana: number
          nivel_jerarquia: number
          nombre: string
        }
        Insert: {
          creado_en?: string
          id?: never
          id_campana: number
          nivel_jerarquia: number
          nombre: string
        }
        Update: {
          creado_en?: string
          id?: never
          id_campana?: number
          nivel_jerarquia?: number
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
        ]
      }
      sesiones_captura_telegram: {
        Row: {
          actualizado_en: string
          chat_id: number
          creado_en: string
          datos_parciales: Json
          id: number
          id_campana: number
          id_usuario: string | null
          paso: string
          telegram_user_id: number
        }
        Insert: {
          actualizado_en?: string
          chat_id: number
          creado_en?: string
          datos_parciales?: Json
          id?: never
          id_campana: number
          id_usuario?: string | null
          paso?: string
          telegram_user_id: number
        }
        Update: {
          actualizado_en?: string
          chat_id?: number
          creado_en?: string
          datos_parciales?: Json
          id?: never
          id_campana?: number
          id_usuario?: string | null
          paso?: string
          telegram_user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "sesiones_captura_telegram_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
        ]
      }
      sesiones_captura_whatsapp: {
        Row: {
          actualizado_en: string
          creado_en: string
          datos_parciales: Json
          id: number
          id_campana: number
          id_usuario: string | null
          paso: string
          perfil_nombre: string | null
          telefono: string
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          datos_parciales?: Json
          id?: never
          id_campana: number
          id_usuario?: string | null
          paso?: string
          perfil_nombre?: string | null
          telefono: string
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          datos_parciales?: Json
          id?: never
          id_campana?: number
          id_usuario?: string | null
          paso?: string
          perfil_nombre?: string | null
          telefono?: string
        }
        Relationships: [
          {
            foreignKeyName: "sesiones_captura_whatsapp_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_novedad: {
        Row: {
          creado_en: string
          id: number
          id_campana: number
          novedad: string
        }
        Insert: {
          creado_en?: string
          id?: never
          id_campana: number
          novedad: string
        }
        Update: {
          creado_en?: string
          id?: never
          id_campana?: number
          novedad?: string
        }
        Relationships: [
          {
            foreignKeyName: "tipos_novedad_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
        ]
      }
      uso_campana: {
        Row: {
          cantidad: number
          id: number
          id_campana: number
          metrica: string
          periodo_fin: string | null
          periodo_inicio: string | null
          proveedor: Database["public"]["Enums"]["proveedor_integracion"]
          registrado_en: string
        }
        Insert: {
          cantidad?: number
          id?: never
          id_campana: number
          metrica: string
          periodo_fin?: string | null
          periodo_inicio?: string | null
          proveedor: Database["public"]["Enums"]["proveedor_integracion"]
          registrado_en?: string
        }
        Update: {
          cantidad?: number
          id?: never
          id_campana?: number
          metrica?: string
          periodo_fin?: string | null
          periodo_inicio?: string | null
          proveedor?: Database["public"]["Enums"]["proveedor_integracion"]
          registrado_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "uso_campana_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
        ]
      }
      verificaciones_registraduria: {
        Row: {
          actualizado_en: string
          apellidos_oficial: string | null
          consultado_en: string | null
          creado_en: string
          datos_crudos: Json | null
          departamento: string | null
          documento: string
          estado: Database["public"]["Enums"]["estado_verificacion_registraduria"]
          id: number
          id_campana: number
          id_corrida: string | null
          intentos: number
          mensaje_error: string | null
          mesa: string | null
          municipio: string | null
          nombres_oficial: string | null
          puesto_votacion: string | null
          tipo_documento: Database["public"]["Enums"]["tipo_documento"]
        }
        Insert: {
          actualizado_en?: string
          apellidos_oficial?: string | null
          consultado_en?: string | null
          creado_en?: string
          datos_crudos?: Json | null
          departamento?: string | null
          documento: string
          estado?: Database["public"]["Enums"]["estado_verificacion_registraduria"]
          id?: never
          id_campana: number
          id_corrida?: string | null
          intentos?: number
          mensaje_error?: string | null
          mesa?: string | null
          municipio?: string | null
          nombres_oficial?: string | null
          puesto_votacion?: string | null
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"]
        }
        Update: {
          actualizado_en?: string
          apellidos_oficial?: string | null
          consultado_en?: string | null
          creado_en?: string
          datos_crudos?: Json | null
          departamento?: string | null
          documento?: string
          estado?: Database["public"]["Enums"]["estado_verificacion_registraduria"]
          id?: never
          id_campana?: number
          id_corrida?: string | null
          intentos?: number
          mensaje_error?: string | null
          mesa?: string | null
          municipio?: string | null
          nombres_oficial?: string | null
          puesto_votacion?: string | null
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"]
        }
        Relationships: [
          {
            foreignKeyName: "verificaciones_registraduria_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
        ]
      }
      votantes: {
        Row: {
          actualizado_en: string
          apellidos: string
          canal_origen: Database["public"]["Enums"]["canal_captura"]
          creado_en: string
          creado_por: string | null
          detalle_novedad: string | null
          direccion: string | null
          documento: string
          embedding: string | null
          estado: Database["public"]["Enums"]["estado_votante"]
          fecha_nacimiento: string | null
          id: number
          id_campana: number
          id_lider_directo: number | null
          id_lugar_trabajo: number | null
          id_puesto_votacion: number | null
          id_rol: number | null
          id_tipo_novedad: number | null
          mesa: string | null
          nombres: string
          sexo: Database["public"]["Enums"]["tipo_sexo"] | null
          telefono: string | null
          tipo_documento: Database["public"]["Enums"]["tipo_documento"]
        }
        Insert: {
          actualizado_en?: string
          apellidos: string
          canal_origen?: Database["public"]["Enums"]["canal_captura"]
          creado_en?: string
          creado_por?: string | null
          detalle_novedad?: string | null
          direccion?: string | null
          documento: string
          embedding?: string | null
          estado?: Database["public"]["Enums"]["estado_votante"]
          fecha_nacimiento?: string | null
          id?: never
          id_campana: number
          id_lider_directo?: number | null
          id_lugar_trabajo?: number | null
          id_puesto_votacion?: number | null
          id_rol?: number | null
          id_tipo_novedad?: number | null
          mesa?: string | null
          nombres: string
          sexo?: Database["public"]["Enums"]["tipo_sexo"] | null
          telefono?: string | null
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"]
        }
        Update: {
          actualizado_en?: string
          apellidos?: string
          canal_origen?: Database["public"]["Enums"]["canal_captura"]
          creado_en?: string
          creado_por?: string | null
          detalle_novedad?: string | null
          direccion?: string | null
          documento?: string
          embedding?: string | null
          estado?: Database["public"]["Enums"]["estado_votante"]
          fecha_nacimiento?: string | null
          id?: never
          id_campana?: number
          id_lider_directo?: number | null
          id_lugar_trabajo?: number | null
          id_puesto_votacion?: number | null
          id_rol?: number | null
          id_tipo_novedad?: number | null
          mesa?: string | null
          nombres?: string
          sexo?: Database["public"]["Enums"]["tipo_sexo"] | null
          telefono?: string | null
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"]
        }
        Relationships: [
          {
            foreignKeyName: "votantes_id_campana_fkey"
            columns: ["id_campana"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votantes_id_lider_directo_fkey"
            columns: ["id_lider_directo"]
            isOneToOne: false
            referencedRelation: "votantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votantes_id_lugar_trabajo_fkey"
            columns: ["id_lugar_trabajo"]
            isOneToOne: false
            referencedRelation: "lugares_trabajo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votantes_id_puesto_votacion_fkey"
            columns: ["id_puesto_votacion"]
            isOneToOne: false
            referencedRelation: "puestos_votacion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votantes_id_rol_fkey"
            columns: ["id_rol"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votantes_id_tipo_novedad_fkey"
            columns: ["id_tipo_novedad"]
            isOneToOne: false
            referencedRelation: "tipos_novedad"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      es_dueno_plataforma: { Args: never; Returns: boolean }
      ids_campanas_usuario: { Args: never; Returns: number[] }
      match_puestos_votacion: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_votantes: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      puede_administrar_campana: {
        Args: { p_id_campana: number }
        Returns: boolean
      }
      puede_editar_campana: { Args: { p_id_campana: number }; Returns: boolean }
      puede_leer_campana: { Args: { p_id_campana: number }; Returns: boolean }
      subarbol_votantes: {
        Args: { id_votante_raiz: number }
        Returns: {
          id_votante: number
          profundidad: number
        }[]
      }
    }
    Enums: {
      canal_captura: "whatsapp" | "telegram" | "web" | "web_publico" | "manual"
      estado_campana: "activa" | "pausada" | "finalizada" | "purgada"
      estado_cuarentena: "pendiente" | "resuelto" | "descartado" | "escalado"
      estado_verificacion_registraduria:
        | "pendiente"
        | "en_proceso"
        | "exitoso"
        | "error"
        | "discrepancia_nombre"
      estado_votante:
        | "activo"
        | "en_cuarentena"
        | "pendiente_verificacion"
        | "rechazado"
      proveedor_integracion:
        | "twilio"
        | "resolutor_captcha"
        | "telegram"
        | "ia_e14"
        | "supabase"
      rol_miembro_campana: "lector" | "editor" | "administrador_campana"
      rol_plataforma: "dueno_plataforma"
      tipo_coincidencia_cuarentena:
        | "cedula_exacta"
        | "telefono_similitud_nombre"
      tipo_documento: "CC" | "TI" | "CE" | "PA" | "PEP" | "PPT"
      tipo_sexo: "Masculino" | "Femenino"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      canal_captura: ["whatsapp", "telegram", "web", "web_publico", "manual"],
      estado_campana: ["activa", "pausada", "finalizada", "purgada"],
      estado_cuarentena: ["pendiente", "resuelto", "descartado", "escalado"],
      estado_verificacion_registraduria: [
        "pendiente",
        "en_proceso",
        "exitoso",
        "error",
        "discrepancia_nombre",
      ],
      estado_votante: [
        "activo",
        "en_cuarentena",
        "pendiente_verificacion",
        "rechazado",
      ],
      proveedor_integracion: [
        "twilio",
        "resolutor_captcha",
        "telegram",
        "ia_e14",
        "supabase",
      ],
      rol_miembro_campana: ["lector", "editor", "administrador_campana"],
      rol_plataforma: ["dueno_plataforma"],
      tipo_coincidencia_cuarentena: [
        "cedula_exacta",
        "telefono_similitud_nombre",
      ],
      tipo_documento: ["CC", "TI", "CE", "PA", "PEP", "PPT"],
      tipo_sexo: ["Masculino", "Femenino"],
    },
  },
} as const
