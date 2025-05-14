```yaml
AWSTemplateFormatVersion: '2010-09-09' # Versión del formato de la plantilla de AWS CloudFormation.
Description: 'Plantilla de CloudFormation para crear un bucket S3 configurado como sitio web estático. Compatible con ObjectOwnership BucketOwnerEnforced.'
# Descripción de la plantilla. Explica que se usará para un sitio web estático generado con Vite.

Parameters:
  BucketName: # Parámetro que permite al usuario especificar el nombre del bucket S3.
    Type: String # Tipo de dato del parámetro (en este caso, una cadena de texto).
    Description: 'Nombre único del bucket (en minúsculas, sin caracteres especiales)' 
    # Descripción del parámetro. El nombre debe ser único y cumplir con las reglas de AWS para nombres de buckets.

Resources: # Sección donde se definen los recursos que se crearán en AWS.
  ReactSiteBucket: # Recurso principal: un bucket de S3 para alojar el sitio web.
    Type: AWS::S3::Bucket # Especifica que este recurso es un bucket de S3.
    Properties:
      BucketName: !Ref BucketName # Asigna el nombre del bucket usando el parámetro proporcionado.
      OwnershipControls: # Configuración para garantizar que el propietario del bucket tenga control total.
        Rules:
          - ObjectOwnership: BucketOwnerEnforced # Evita conflictos con las ACLs (listas de control de acceso).
      PublicAccessBlockConfiguration: # Configuración para permitir acceso público controlado.
        BlockPublicAcls: false # No bloquea las ACLs públicas.
        IgnorePublicAcls: false # No ignora las ACLs públicas.
        BlockPublicPolicy: false # No bloquea políticas públicas.
        RestrictPublicBuckets: false # No restringe los buckets públicos.
      WebsiteConfiguration: # Configuración para habilitar el bucket como un sitio web estático.
        IndexDocument: index.html # Archivo que se mostrará como página principal.
        ErrorDocument: index.html # Archivo que se mostrará en caso de errores (como rutas no encontradas).

  BucketPolicy: # Recurso para definir la política de acceso al bucket.
    Type: AWS::S3::BucketPolicy # Especifica que este recurso es una política de bucket.
    Properties:
      Bucket: !Ref ReactSiteBucket # Aplica la política al bucket creado anteriormente.
      PolicyDocument: # Documento que define las reglas de acceso.
        Version: '2012-10-17' # Versión del documento de política.
        Statement: # Lista de declaraciones de permisos.
          - Sid: PublicReadGetObject # Identificador único para esta declaración.
            Effect: Allow # Permite el acceso.
            Principal: '*' # Aplica a cualquier usuario (acceso público).
            Action: 's3:GetObject' # Permite la acción de obtener objetos del bucket.
            Resource: !Sub '${ReactSiteBucket.Arn}/*' # Aplica a todos los objetos dentro del bucket.

Outputs: # Sección para definir salidas de la plantilla (información útil después de la creación).
  WebsiteURL: # Salida que proporciona la URL del sitio web.
    Description: 'URL del sitio web (endpoint S3 Website)' # Descripción de la salida.
    Value: !GetAtt ReactSiteBucket.WebsiteURL # Obtiene la URL del sitio web estático del bucket.

```

Explicación general:
Este archivo es una plantilla de AWS CloudFormation que crea un bucket S3 configurado para alojar un sitio web estático. Incluye:

Parámetros: Permiten personalizar el nombre del bucket.
Recursos: Define el bucket S3 y su política de acceso.
Salidas: Proporciona la URL del sitio web generado.
Los comentarios explican cada línea para que los principiantes puedan entender cómo funciona esta plantilla.


## acls false

Razón para configurarlos en false:
Acceso público necesario para un sitio web estático:

Este bucket está configurado para alojar un sitio web estático. Para que los usuarios puedan acceder a los archivos (como index.html y otros recursos estáticos), el bucket debe permitir acceso público.
Si estas configuraciones estuvieran en true, el acceso público sería bloqueado, y los usuarios no podrían acceder al sitio web.
Control mediante políticas:

Aunque las ACLs públicas no están bloqueadas, el acceso público está controlado mediante la política del bucket (BucketPolicy). Esto asegura que solo se permita el acceso público necesario (como s3:GetObject para leer los archivos del sitio web).
Compatibilidad con la configuración de ObjectOwnership:

La propiedad ObjectOwnership: BucketOwnerEnforced asegura que el propietario del bucket tenga control total, eliminando la necesidad de depender de ACLs para gestionar permisos.
En resumen:
Estas configuraciones están en false porque el objetivo es permitir el acceso público al bucket para que funcione como un sitio web estático. Sin embargo, el acceso está cuidadosamente controlado mediante la política del bucket para evitar accesos no deseados.


ObjectOwnership: BucketOwnerEnforced es una configuración de Amazon S3 que asegura que el propietario del bucket tenga control total sobre todos los objetos almacenados en el bucket, independientemente de quién los haya subido. Esta configuración elimina la dependencia de las ACLs (Access Control Lists) para gestionar permisos y simplifica el control de acceso.

¿Qué hace BucketOwnerEnforced?
Propiedad de los objetos:

Todos los objetos en el bucket son automáticamente propiedad del propietario del bucket, incluso si fueron subidos por otro usuario o cuenta de AWS.
Deshabilita las ACLs:

Las ACLs (listas de control de acceso) se deshabilitan para el bucket y sus objetos. Esto significa que no se pueden usar ACLs para otorgar permisos a otros usuarios o cuentas.
Control centralizado:

El acceso al bucket y a los objetos se gestiona exclusivamente mediante políticas de bucket, políticas de IAM (Identity and Access Management) o políticas de roles. Esto simplifica la administración y reduce el riesgo de configuraciones incorrectas.
Ventajas de BucketOwnerEnforced:
Simplificación: Al deshabilitar las ACLs, se reduce la complejidad de gestionar permisos.
Seguridad: Garantiza que el propietario del bucket tenga control total sobre los objetos, evitando conflictos de propiedad.
Compatibilidad: Es ideal para configuraciones modernas donde se prefieren políticas de bucket o IAM en lugar de ACLs.
Ejemplo de uso:
En el archivo s3-react-site.yaml, esta configuración se aplica al bucket con la siguiente sección:

En resumen:
BucketOwnerEnforced es una configuración que asegura que el propietario del bucket tenga control total sobre los objetos y elimina la necesidad de usar ACLs, promoviendo un enfoque más seguro y centralizado para la gestión de permisos en S3.