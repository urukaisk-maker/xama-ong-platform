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
    BANCO_ALIMENTOS = "banco_alimentos"
    DONACION = "donacion"
    EXCEDENTE = "excedente"
    COMPRA = "compra"


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
