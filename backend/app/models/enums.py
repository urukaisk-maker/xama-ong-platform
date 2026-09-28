from enum import Enum


class Site(str, Enum):
    REUS = "reus"
    TARRAGONA = "tarragona"


class UserRole(str, Enum):
    JUNTA = "junta"
    COORDINADOR_REUS = "coordinador_reus"
    COORDINADOR_TARRAGONA = "coordinador_tarragona"
    VOLUNTARIO = "voluntario"
    SERVICIOS_SOCIALES = "servicios_sociales"


class DeliveryStatus(str, Enum):
    PENDIENTE = "pendiente"
    ENTREGADA = "entregada"
    CANCELADA = "cancelada"


class DerivationStatus(str, Enum):
    PENDIENTE = "pendiente"
    SERVIDA = "servida"
    CANCELADA = "cancelada"


class BatchOrigin(str, Enum):
    DONACION_CORPORATIVA = "donacion_corporativa"
    CAMPANA_SOLIDARIA = "campana_solidaria"
    COMIDA_COCINADA = "comida_cocinada"
    EXCEDENTE_AGRICOLA = "excedente_agricola"
    COMERCIO_LOCAL = "comercio_local"


class BatchStatus(str, Enum):
    DISPONIBLE = "disponible"
    AGOTADO = "agotado"
    CADUCADO = "caducado"


class ProductCategory(str, Enum):
    PANADERIA = "panaderia"
    FRUTA = "fruta"
    LEGUMBRES = "legumbres"
    BOLLERIA = "bolleria"
    LACTEOS = "lacteos"
    GRANOS = "granos"
    CONSERVAS = "conservas"
    VERDURA = "verdura"
    ACEITES = "aceites"


class ProductUnit(str, Enum):
    LITRO = "litro"
    UNIDAD = "unidad"
    KG = "kg"


class VolunteerShiftRole(str, Enum):
    VEHICULO = "vehiculo"
    CLASIFICACION = "clasificacion"
    CESTAS = "cestas"
    PUERTA = "puerta"


class ReferralSource(str, Enum):
    SERVICIOS_SOCIALES = "servicios_sociales"
    POLICIA_LOCAL = "policia_local"
    CRUZ_ROJA = "cruz_roja"
    OTRO = "otro"
