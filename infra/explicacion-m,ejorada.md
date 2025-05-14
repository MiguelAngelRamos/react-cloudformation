```yaml
# ==========================================================================================================
#  S3 STATIC REACT SITE – CLOUDFORMATION TEMPLATE (🎓 Súper comentada para aclarar TODAS las dudas)
# ==========================================================================================================
#  ¿Qué vamos a crear? 👇
#    • Un bucket S3 configurado como sitio web estático (ideal para React/Vite).
#    • Control de propiedad centralizado con `BucketOwnerEnforced` (bye-bye ACLs).
#    • Exposición pública **solo** de lectura con una BucketPolicy.
#    • Flags “Public Access Block” en *false* para que la política púbica surta efecto.
# ----------------------------------------------------------------------------------------------------------

AWSTemplateFormatVersion: '2010-09-09'   # Versión del DSL de CloudFormation (siempre igual).

Description: |
  Plantilla CFN para alojar un sitio web estático (ej. React) en S3:
    1. El bucket *siempre* será dueño de sus objetos ➜ `ObjectOwnership: BucketOwnerEnforced`.
    2. Se desactivan los bloqueos de “Public Access Block” (ver comentarios más abajo).
    3. Política pública mínima: `s3:GetObject` a `*` (cualquier visitante).
    4. Se habilita el hosting de sitio web con `index.html` tanto para home como para 404.

# ─────────────────────────────────────────────────────────────────────────────
# 1️⃣  PARÁMETROS – permitir al usuario elegir el nombre del bucket
# ─────────────────────────────────────────────────────────────────────────────
Parameters:
  BucketName:
    Type: String
    Description: Nombre único para el bucket. Todo en minúsculas, sin puntos al final (reglas de S3).

# ─────────────────────────────────────────────────────────────────────────────
# 2️⃣  RECURSOS – aquí se define el bucket y su política
# ─────────────────────────────────────────────────────────────────────────────
Resources:

  ReactSiteBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref BucketName

      # 2.1 OwnershipControls – adiós ACLs, hola control centralizado 🛡️
      OwnershipControls:
        Rules:
          - ObjectOwnership: BucketOwnerEnforced  # Todos los objetos pasan a ser propiedad del bucket owner.

      # 2.2 PublicAccessBlock – 🔑 Por qué los dejamos en “false”
      # -----------------------------------------------------------------
      #  • Estos 4 flags, si están en true, bloquean *cualquier* forma de acceso público,
      #    aun cuando ya no usemos ACLs (gracias a BucketOwnerEnforced) y
      #    aun cuando tengamos una BucketPolicy que permita GET.
      #  • Para un sitio web estático **queremos** que la política de lectura funcione,
      #    así que los ponemos en false.  (= “No bloquear, déjame controlar con la policy”)
      PublicAccessBlockConfiguration:
        BlockPublicAcls: false      # no rechaces ACLs públicas (aunque no las usaremos, evita errores si se sube con ACL accidental).
        IgnorePublicAcls: false     # no ignores ACLs – inofensivo porque están deshabilitadas.
        BlockPublicPolicy: false    # si la policy es pública quiero que se aplique 👍
        RestrictPublicBuckets: false# idem, no restrinjas políticas públicas.

      # 2.3 WebsiteConfiguration – aquí activamos el endpoint estático 🌍
      WebsiteConfiguration:
        IndexDocument: index.html   # documento raíz
        ErrorDocument: index.html   # React SPA → todas las rutas vuelven a index.html

  # 2.4 BucketPolicy – acceso público SOLO lectura 📜
  BucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref ReactSiteBucket
      PolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Sid: PublicReadGetObject          # Identificador legible
            Effect: Allow                     # Permitimos…
            Principal: '*'                    # …a cualquiera…
            Action: 's3:GetObject'            # …obtener (GET)…
            Resource: !Sub '${ReactSiteBucket.Arn}/*'  # …todos los objetos.

# ─────────────────────────────────────────────────────────────────────────────
# 3️⃣  SALIDAS – mostramos la URL del sitio web
# ─────────────────────────────────────────────────────────────────────────────
Outputs:
  WebsiteURL:
    Description: Endpoint HTTP del sitio web (usa CloudFront para HTTPS personalizado).
    Value: !GetAtt ReactSiteBucket.WebsiteURL
```

### 📝 Notas rápidas sobre los flags Public Access Block

| Flag                      | Efecto si está `true`                                                    | Motivo de ponerlo `false` en un sitio web                                                   |
| ------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| **BlockPublicAcls**       | Rechaza cualquier ACL “public-read”                                      | No usamos ACLs, pero evitará mensajes de error si alguien sube archivos con ACL accidental. |
| **IgnorePublicAcls**      | Ignora ACLs públicas existentes                                          | Mismo razonamiento: coherencia con el flag anterior.                                        |
| **BlockPublicPolicy**     | S3 bloqueará… ¡incluso la política pública que estamos declarando! ⇒ 403 | Debe ser `false` para que la BucketPolicy de lectura se aplique.                            |
| **RestrictPublicBuckets** | Fuerza 403 aunque exista política pública                                | También debe ser `false` o el sitio no cargará.                                             |

> **Conclusión**: aunque `BucketOwnerEnforced` ya deshabilita ACLs, los
> flags Public Access Block siguen siendo una “puerta” adicional; hay que
> abrirla (ponerlos en `false`) para que la política de lectura sea
> efectiva y el sitio esté disponible públicamente.
